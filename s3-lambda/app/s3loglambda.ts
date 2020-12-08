import { BucketEvent } from "@pulumi/aws/s3";

export const onObjectCreatedLambda = (e: BucketEvent) => {
    for (const rec of e.Records || []) {
        console.log(`File ${rec.s3.object.key} was uploaded.`)
    }
};