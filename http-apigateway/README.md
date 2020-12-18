# Basic APIGatewayV2 HTTP API demo

## To run

`npm install`

`pulumi stack init dev`

`pulumi config set aws:region {AWS Region}`

`pulumi up`

# To test
`curl ${pulumi stack output endpoint}`