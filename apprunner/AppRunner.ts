import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";
import { Output } from "@pulumi/pulumi";

interface AppRunnerArgs {
  pathToDocker: string;
}

export class AppRunner extends pulumi.ComponentResource {
  Url: Output<string>;
  constructor(
    name: string,
    args: AppRunnerArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("x:AppRunner", name, opts);

    const role = new aws.iam.Role(
      `${name}-appRunnerEcrRole`,
      {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: "build.apprunner.amazonaws.com",
        }),
      },
      { parent: this }
    );

    const ecrPolicy = new aws.iam.Policy(
      `${name}-appRunnerEcrPolicy`,
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:DescribeImages",
              ],
              Resource: "*",
            },
          ],
        },
      },
      { parent: this }
    );

    new aws.iam.RolePolicy(
      `${name}-rolePolicy`,
      {
        policy: ecrPolicy.policy,
        role: role,
      },
      { parent: this }
    );

    const repo = new aws.ecr.Repository(
      `${name}-imagerepository`,
      {},
      { parent: this }
    );

    const credentials = repo.registryId.apply(async (registryId) => {
      const credentials = await aws.ecr.getCredentials({
        registryId,
      });
      const decodedCredentials = Buffer.from(
        credentials.authorizationToken,
        "base64"
      ).toString();
      const [username, password] = decodedCredentials.split(":");
      return { server: credentials.proxyEndpoint, username, password };
    });

    const image = new docker.Image(
      "myapp",
      {
        imageName: repo.repositoryUrl,
        build: "./app",
        registry: credentials,
      },
      { parent: this }
    );

    const app = new aws.apprunner.Service("service", {
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: role.arn
        },
        imageRepository: {
          imageRepositoryType: "ECR",
          imageIdentifier: image.imageName,
          imageConfiguration: {
            port: "80",
          },
        },
        autoDeploymentsEnabled: true,
      },
      serviceName: "helloworld",
    });

    this.Url = app.serviceUrl;

    this.registerOutputs({
      Url: this.Url,
    });
  }
}
