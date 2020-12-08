import * as aws from "@pulumi/aws";
import * as s3 from "./s3";
import * as lambdas from "./app";

const bucket = aws.s3.Bucket.get("bucket", s3.bucketId);

bucket.onObjectCreated("fileupload-handler", 
                    new aws.lambda.CallbackFunction("fileupload-function", {
                        callback: lambdas.onObjectCreatedLambda,
                        runtime: aws.lambda.NodeJS12dXRuntime
                    }));

export const bucketId = s3.bucketId;