import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";

const repo = new aws.ecr.Repository(
    `imagerepository`,
    {}
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
    }
  );

const provider = new docker.Provider("provider", {
    registryAuth: [{
        username: credentials.username,
        password: credentials.password,
        address: credentials.server
    }]
})

const myImage = new docker.RemoteImage("myImage", {
    name: image.baseImageName,
    keepLocally: true
}, {provider, dependsOn: [image]})

export const repoUrl = repo.repositoryUrl;
export const credServe = credentials.server;
export const imageName = image.imageName;
export const baseImageName = image.baseImageName;