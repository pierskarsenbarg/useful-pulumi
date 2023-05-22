import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";
import {hashPath} from "./utils";

const role = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
    aws.iam.Principals.LambdaPrincipal
  ),
  managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole],
});

const lambda = new aws.lambda.Function("api-lambda", {
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("./app"),
  }),
  role: role.arn,
  runtime: aws.lambda.Runtime.NodeJS18dX,
  handler: "index.handler",
});

const api = new aws.apigateway.RestApi("api");

const method = new aws.apigateway.Method("method", {
  resourceId: api.rootResourceId,
  restApi: api.id,
  httpMethod: "POST",
  authorization: "NONE",
});

const integration = new aws.apigateway.Integration("integration", {
  httpMethod: method.httpMethod,
  resourceId: api.rootResourceId,
  restApi: api.id,
  integrationHttpMethod: "POST",
  uri: lambda.invokeArn,
  type: "AWS",
});

const integrationresponse = new aws.apigateway.IntegrationResponse(
  "integrationresponse",
  {
    httpMethod: method.httpMethod,
    restApi: api.id,
    resourceId: api.rootResourceId,
    statusCode: "200",
  },
  {dependsOn: [integration]}
);

const methodResponse = new aws.apigateway.MethodResponse("methodresponse", {
  httpMethod: method.httpMethod,
  resourceId: api.rootResourceId,
  restApi: api.id,
  statusCode: "200",
}, {dependsOn: [integrationresponse]});


const permission = new aws.lambda.Permission("permission", {
  action: "lambda:InvokeFunction",
  function: lambda.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

const deployment = new aws.apigateway.Deployment("deployment", {
  restApi: api.id,
  triggers: {
    redeployment: hashPath(path.join(__filename))
  }
}, {
    // These are all required otherwise the deployment will fail
    dependsOn: [
      integration, 
      integrationresponse, 
      method, 
      methodResponse]
});

const stage = new aws.apigateway.Stage("stage", {
  deployment: deployment.id,
  restApi: api.id,
  stageName: pulumi.getStack(),
});

export const url = pulumi.interpolate`${stage.invokeUrl}/`;