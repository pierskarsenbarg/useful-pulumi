import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import requestLambda from "./lambda";

const bucket = new aws.s3.Bucket("cloudFrontBucket", {
  acl: "private",
  website: {
    indexDocument: "index.html",
    errorDocument: "404.html",
  },
});

const index = new aws.s3.BucketObject("indexpage", {
  bucket: bucket,
  key: "index.html",
  source: new pulumi.asset.FileAsset("index.html"),
  contentType: "text/html",
});

const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
  "originaccessidentity"
);

function publicReadPolicyForBucket(bucketName: string): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [
          pulumi.interpolate`${bucket.arn}/*`
        ],
      },
    ],
  };
}

// Set the access policy for the bucket so all objects are readable
let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
  bucket: bucket.bucket, // refer to the bucket created earlier
  policy: bucket.bucket.apply(publicReadPolicyForBucket), // use output property `siteBucket.bucket`,
});

const targetOriginId: string = "s3Origin";

const s3Distribution = new aws.cloudfront.Distribution("s3Distribution", {
  origins: [
    {
      domainName: bucket.bucketRegionalDomainName,
      originId: targetOriginId,
      customOriginConfig: {
        originProtocolPolicy: "http-only",
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ["TLSv1.2"],
      },
    },
  ],
  enabled: true,
  defaultCacheBehavior: {
    allowedMethods: ["GET", "HEAD"],
    cachedMethods: ["GET", "HEAD"],
    targetOriginId: targetOriginId,
    forwardedValues: {
      queryString: false,
      cookies: {
        forward: "none",
      },
    },
    viewerProtocolPolicy: "redirect-to-https",
    lambdaFunctionAssociations: [{
        eventType: "viewer-response",
        lambdaArn: requestLambda
    }]
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "whitelist",
      locations: ["US", "CA", "GB", "DE"],
    },
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
  defaultRootObject: "index.html",
  
});

export const url = pulumi.interpolate`https://${s3Distribution.domainName}`;