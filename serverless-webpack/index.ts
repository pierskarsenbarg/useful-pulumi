import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const role = new aws.iam.Role("lambda-demo-role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole]
});

const lambda1 = new aws.lambda.Function("lambda1", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./dist/lambda1")
    }),
    role: role.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS18dX
});

const lambda2 = new aws.lambda.Function("lambda2", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./dist/lambda2"),
    }),
    role: role.arn,
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS18dX
});