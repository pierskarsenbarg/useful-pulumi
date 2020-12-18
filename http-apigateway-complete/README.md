# APIGatewayV2 HTTP API demo

This will give you a more configurable setup than the quick start

## To run

`npm install`

`pulumi stack init dev`

`pulumi config set aws:region {AWS Region}`

`pulumi up`

# To test
`curl ${pulumi stack output endpoint}`