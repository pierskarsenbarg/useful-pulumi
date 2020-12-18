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

const lambda = new aws.lambda.Function("pk-lambda", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app"),
     }),
     runtime: "nodejs12.x",
     role: lambdaRole.arn,
     handler: "index.handler",
});

const pk_http_gw = new aws.apigatewayv2.Api("pk-http-gw", {
    apiKeySelectionExpression: `$request.header.x-api-key`,
    name: "http-console",
    protocolType: "HTTP",
    routeSelectionExpression: `$request.method $request.path`,
}, {
    protect: true,
});

const route = new aws.apigatewayv2.Route("route", {
    apiId: "myvktkold2",
    apiKeyRequired: false,
    authorizationType: "NONE",
    routeKey: "ANY /",
    target: "integrations/l2oguxd",
}, {
    protect: true,
});




