# SSH Box

For when you just need an ec2 instance in a vpc to ssh into

(assuming you already have an ssh key set up)

## Setup

1. `npm install`
1. `pulumi stack init dev`
1. `pulumi config set aws:region {region}`
1. `cat ~/.ssh/id_rsa.pub | pulumi config set publicKey --`
1. `pulumi up -y`
1. `ssh -i ~/.ssh/id_rsa ec2-user@${pulumi stack output ip}`

Don't forget to `pulumi destroy -y` when you're done.

This assumes that you want to have the ec2 instance in the default vpc. If you want it in a new vpc then you can run `pulumi config set useDefaultVpc false`