import * as aws from "@pulumi/aws";

const secretContainer = new aws.secretsmanager.Secret("secretContainer");

const secret2 = new aws.secretsmanager.SecretVersion("secret2", {
    secretId: secretContainer.id,
    secretString: "mysecret"
})