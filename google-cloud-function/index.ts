import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config("gcp");

const bucket = new gcp.storage.Bucket("bucket");

const archive = new gcp.storage.BucketObject("object", {
    bucket: bucket.name,
    source: new pulumi.asset.FileArchive("./app")
});

const myfunction = new gcp.cloudfunctions.Function("function", {
    runtime: "nodejs12",
    sourceArchiveBucket: bucket.name,
    sourceArchiveObject: archive.name,
    triggerHttp: true,
    entryPoint: "handler"
});

const invoker = new gcp.cloudfunctions.FunctionIamMember("iammember", {
    project: config.get("project"),
    region: config.get("region"),
    cloudFunction: myfunction.name,
    role: "roles/cloudfunctions.invoker",
    member: "allUsers",
});

export const url = myfunction.httpsTriggerUrl;