import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: {
       Version: "2012-10-17",
       Statement: [{
          Action: "sts:AssumeRole",
          Principal: {
             Service: "lambda.amazonaws.com",
          },
          Effect: "Allow",
          Sid: "",
       }],
    },
 });

 new aws.iam.RolePolicyAttachment("lambdaRoleAttachment", {
    role: lambdaRole,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaFullAccess,
 });

const lambda = new aws.lambda.Function("test-lambda", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app"),
     }),
     runtime: "nodejs12.x",
     role: lambdaRole.arn,
     handler: "index.handler",
     
});

const lambdaPermission = new aws.lambda.Permission("lambdapermission", {
    action: "lambda:InvokeFunction",
    principal: "apigateway.amazonaws.com",
    function: lambda
});


const apigw = new aws.apigatewayv2.Api("http-api", {
    protocolType: "HTTP",
    routeKey: "GET /",
    target: lambda.invokeArn
});

export const endpoint = apigw.apiEndpoint;