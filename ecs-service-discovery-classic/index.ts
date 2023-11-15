import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const vpc = new awsx.ec2.Vpc("vpc", {
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 2,
    subnetSpecs: [{
        type: awsx.ec2.SubnetType.Public,
        name: "public-ecs-subnet",
    }],
    tags: {
        name: "pk-ecs-connect"
    },
    natGateways: {
        strategy: "None"
    }
});

export const vpcid = vpc.vpcId

const repo = new awsx.ecr.Repository("repo", {
    forceDelete: true
});

const image = new awsx.ecr.Image("app-image", {
    repositoryUrl: repo.url,
    context: "./app",
    platform: "linux/amd64"
});

const discoveryNamespace = new aws.servicediscovery.HttpNamespace("discoveryApp");

const cluster = new aws.ecs.Cluster("pk-discovery-cluster", {
    serviceConnectDefaults: {
        namespace: discoveryNamespace.arn
    }
});

const lbSecurityGroup = new aws.ec2.SecurityGroup("lbSg", {
    vpcId: vpc.vpcId,
    ingress: [{
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
        cidrBlocks: ["0.0.0.0/0"]
    }],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"]
    }]
});

const taskSecurityGroup = new aws.ec2.SecurityGroup("taskSg", {
    vpcId: vpc.vpcId,
    ingress: [{
        protocol: "tcp",
        fromPort: 3000,
        toPort: 3000,
        securityGroups: [lbSecurityGroup.id]
    }],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"]
    }]
});

const redisSecurityGroup = new aws.ec2.SecurityGroup("redisSg", {
    vpcId: vpc.vpcId,
    ingress: [{
        protocol: "tcp",
        fromPort: 6379,
        toPort: 6379,
        securityGroups: [taskSecurityGroup.id]
    }],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"]
    }]
})

const lb = new aws.lb.LoadBalancer("lb", {
    securityGroups: [lbSecurityGroup.id],
    subnets: vpc.publicSubnetIds,
});

const tg = new aws.lb.TargetGroup("tg", {
    port: 3000,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.vpcId,
    healthCheck: {
        enabled: true,
        interval: 5,
        healthyThreshold: 2,
        path: "/health",
        protocol: "HTTP",
        port: "3000",
        timeout: 4
    },
    deregistrationDelay: 5
}, {dependsOn: [lb]});

const listener = new aws.lb.Listener("listener", {
    loadBalancerArn: lb.arn,
    port: 80,
    defaultActions: [{
        type: "forward",
        targetGroupArn: tg.arn
    }]
});

const role = new aws.iam.Role("role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.EcsTasksPrincipal), // might be aws.iam.Principals.EcsPrincipal
    managedPolicyArns: [aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy]
});

const logGroup = new aws.cloudwatch.LogGroup("app-loggroup");

const appTaskDefinitionWithEnvVar = new aws.ecs.TaskDefinition("appTdEnvVar", {
    family: "discovery-app-demo",
    cpu: "1024",
    memory: "2048",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    taskRoleArn: role.arn,
    containerDefinitions: pulumi.all([image.imageUri, logGroup.name]).apply(([imageUri, logGroupName]) => JSON.stringify([{
        name: "app",
        image: imageUri,
        portmappings: [{
            containerPort: 3000,
            protocol: "tcp",
            name: "app-port"
        }],
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-create-group": "true",
                "awslogs-group": logGroupName,
                "awslogs-region": "eu-west-1",
                "awslogs-stream-prefix": "app"
            }
        },
        environment: [
            {
                name: "REDIS_PORT",
                value: "6379"
            },
            {
                name: "REDIS_HOST",
                value: "redis"
            }
        ]
    }]))
});

const redistaskDefinition = new aws.ecs.TaskDefinition("redisTd", {
    family: "redis-demo",
    cpu: "1024",
    memory: "2048",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: role.arn,
    taskRoleArn: role.arn,
    containerDefinitions: logGroup.name.apply(logGroupName => JSON.stringify([{
        name: "redis",
        image: "redis:latest",
        portMappings: [{
            containerPort: 6379,
            protocol: "tcp",
            name: "redis-port"
        }],
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-create-group": "true",
                "awslogs-group": logGroupName,
                "awslogs-region": "eu-west-1",
                "awslogs-stream-prefix": "redis"
            }
        }
    }]))
});

const appService = new aws.ecs.Service("appService", {
    cluster: cluster.arn,
    desiredCount: 1,
    launchType: "FARGATE",
    taskDefinition: appTaskDefinitionWithEnvVar.arn,
    networkConfiguration: {
        assignPublicIp: true,
        subnets: vpc.publicSubnetIds,
        securityGroups: [taskSecurityGroup.id]
    },
    loadBalancers: [{
        containerName: "app",
        containerPort: 3000,
        targetGroupArn: tg.arn
    }],
    deploymentMaximumPercent: 200,
    deploymentMinimumHealthyPercent: 100,
    serviceConnectConfiguration: {
        enabled: true,
        namespace: discoveryNamespace.arn,
        services: [{
            portName: "app-port",
            clientAlias: [{
                port: 3000,
                dnsName: "app"
            }]
        }]
    }
});

const redisService = new aws.ecs.Service("redisService", {
    cluster: cluster.arn,
    desiredCount: 1,
    launchType: "FARGATE",
    taskDefinition: redistaskDefinition.arn,
    networkConfiguration: {
        assignPublicIp: true,
        subnets: vpc.publicSubnetIds,
        securityGroups: [redisSecurityGroup.id]
    },
    deploymentMaximumPercent: 200,
    deploymentMinimumHealthyPercent: 100,
    serviceConnectConfiguration: {
        enabled: true,
        namespace: discoveryNamespace.arn,
        services: [{
            portName: "redis-port",
            clientAlias: [{
                port: 6379,
                dnsName: "redis"
            }]
        }]
    }
});

export const url = lb.dnsName;