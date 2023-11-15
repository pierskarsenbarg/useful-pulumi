# ECS Service discovery demo

## Pre-requisites

You'll need to have the following installed:

- NodeJS - https://nodejs.org/en/download
- Pulumi CLI - https://www.pulumi.com/docs/install/
- AWS CLI - https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Docker CLI - https://docs.docker.com/get-docker/

## Setup

1. Clone this repo `git clone git@`
1. Go to the folder: `cd ecs-service-discovery-classic`
1. Set the region you want to deploy to: `pulumi config set aws:region {region}`
1. Run `pulumi up`
1. View output using Curl: `curl $(pulumi stack output url)` (it might take a while for the load balandecer DNS to propogate)

## Destroy 

1. `pulumi destroy`