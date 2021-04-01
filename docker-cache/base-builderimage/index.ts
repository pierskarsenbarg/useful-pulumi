import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const builderImage = new docker.Image("baseImage", {
    imageName: "pierskarsenbarg/piers-test:builder",
    build: {
        target: "builder",
        dockerfile: "./app/Dockerfile",
        context: "./app"
    },
});

