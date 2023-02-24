# AWS Lambda Function and Webpack example

## Pre-Requisites

You must have the following installed: 

- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [NodeJS](https://nodejs.org/en/)

## Instructions

1. Clone repo: `git clone https://github.com/pierskarsenbarg/pulumi-demos
1. Change to directory: `cd serverless-webpack`
1. Install dependencies: `npm install`
1. Run test: `npm run push`

## Notes

- `webpack.config.js` is used to define where the "compiled" lambda code lives
- compiled code is saved under `./dist` (https://github.com/pierskarsenbarg/pulumi-demos/blob/685425718917aa795b110fbee77d12a0ee0d0d3c/serverless-webpack/webpack.config.js#L23-L24)
- The [`code` input](https://github.com/pierskarsenbarg/pulumi-demos/blob/685425718917aa795b110fbee77d12a0ee0d0d3c/serverless-webpack/index.ts#L11-L13) is pointing at the folder holding the compiled lambda code. It will zip it up and upload it to the lambda function. You don't need to zip anything up.
- I've added a couple of node scripts to make life a little easier: https://github.com/pierskarsenbarg/pulumi-demos/blob/685425718917aa795b110fbee77d12a0ee0d0d3c/serverless-webpack/package.json#L17-L20