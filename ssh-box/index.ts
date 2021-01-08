import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const basicTags = {
  Owner: "Piers",
};

const config = new pulumi.Config("ssh-box");
const publicKey = config.require("publicKey");
const useDefaultVpc = config.get("useDefaultVpc") || "true";

let vpc: awsx.ec2.Vpc;

if (useDefaultVpc === "true") {
  vpc = awsx.ec2.Vpc.getDefault();
} else {
  vpc = new awsx.ec2.Vpc("vpc", {
    subnets: [{ type: "public" }],
    numberOfAvailabilityZones: "all",
    tags: {
      ...basicTags,
      Name: "piers-vpc",
    },
    cidrBlock: "10.0.0.0/16",
  });
}

const ami = pulumi.output(
  aws.getAmi({
    filters: [
      {
        name: "name",
        values: ["amzn-ami-hvm-*"],
      },
    ],
    owners: ["137112412989"], // This owner ID is Amazon
    mostRecent: true,
  })
);

const sshSG = new aws.ec2.SecurityGroup("sshSG", {
  tags: basicTags,
  vpcId: vpc.id,
  ingress: [
    {
      toPort: 22,
      fromPort: 22,
      protocol: "tcp",
      cidrBlocks: ["86.28.229.82/32"],
    },
  ],
  egress: [
    { toPort: 0, fromPort: 0, protocol: "-1", cidrBlocks: ["0.0.0.0/0"] },
  ],
});

const keyPair = new aws.ec2.KeyPair("publicKey", {
  publicKey,
});

const ec2 = new aws.ec2.Instance("instance", {
  instanceType: aws.ec2.InstanceType.T3_Small,
  vpcSecurityGroupIds: [sshSG.id],
  ami: ami.id,
  keyName: keyPair.keyName,
  subnetId: pulumi.output(vpc.publicSubnetIds)[0],
  tags: {
    Name: "pk-instance",
    ...basicTags,
  },
});

export const ip = ec2.publicIp;
