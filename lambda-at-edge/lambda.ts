// Copyright 2020 Pulumi Corporation. All rights reserved.
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const name = "EdgeLambda"

const role = new aws.iam.Role(`${name}-Role`, {
    assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Principal: aws.iam.Principals.LambdaPrincipal,
                Effect: "Allow",
            },
            {
                Action: "sts:AssumeRole",
                Principal: aws.iam.Principals.EdgeLambdaPrincipal,
                Effect: "Allow",
            },
        ],
    },
});

const rolePolicy = new aws.iam.RolePolicyAttachment(`${name}-RolePolicyAttachment`, {
    role,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
});

// Some resources _must_ be put in us-east-1, such as Lambda at Edge.
const awsUsEast1 = new aws.Provider("us-east-1", {region: "us-east-1"});

const lambda = new aws.lambda.CallbackFunction(`${name}-Function`, {
    publish: true,
    role,
    timeout: 5,
    callback: async (event: any, context: aws.lambda.Context) => {  
        const response = event.Records[0].cf.response;
        console.log(response);

        response.headers["X-Made-With-Love-By"] = [{
            key: "X-Made-With-Love-By",
            value: "Pulumi"
          }];

        return response;
    }
}, { provider: awsUsEast1 });

// Not using qualifiedArn here due to some bugs around sometimes returning $LATEST
export default pulumi.interpolate`${lambda.arn}:${lambda.version}`;