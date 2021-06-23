import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const bucket = new gcp.storage.Bucket("bucket");


// Google Cloud Function in Python

const bucketObjectPython = new gcp.storage.BucketObject("python-zip", {
    bucket: bucket.name,
    source: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./func"),
    }),
});

const functionPython = new gcp.cloudfunctions.Function("python-func", {
    sourceArchiveBucket: bucket.name,
    runtime: "nodejs14",
    sourceArchiveObject: bucketObjectPython.name,
    entryPoint: "helloWorld",
    triggerHttp: true,
    availableMemoryMb: 128,
});

const pyInvoker = new gcp.cloudfunctions.FunctionIamMember("py-invoker", {
    project: functionPython.project,
    region: functionPython.region,
    cloudFunction: functionPython.name,
    role: "roles/cloudfunctions.invoker",
    member: "allUsers",
});

export const pythonEndpoint = functionPython.httpsTriggerUrl;