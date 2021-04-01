import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker"

const baseBuilder = new docker.RemoteImage("baseBuilder", {
    name: "pierskarsenbarg/piers-test:builder"
})

const runtimeImage = new docker.Image("runtimeImage", {
    build: {
        context: "./app",
        target: "runtime",
        cacheFrom: {
            stages: ["builder"]
        }
    },
    imageName: "pierskarsenbarg/piers-test:latest"
});

