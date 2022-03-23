import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";
import {AppRunner} from "./AppRunner";

const app = new AppRunner("helloworld", {
  pathToDocker: "./app"
});

export const url = app.Url;