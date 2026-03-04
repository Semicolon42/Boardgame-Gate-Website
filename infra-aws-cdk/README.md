# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Commands - Checking Things
* `npx cdk synth`   emits the synthesized CloudFormation template

## Commands - Deploying and checking deployment
* `npx cdk bootstrap` Prepare to deploy
* `npx cdk deploy`    deploy this stack to your default AWS account/region
* `npx cdk diff`      compare deployed stack with current state
* `npx cdk list`      Lists stacks. If ______ appears, it's deployed.
* `npx cdk destroy`   Destorys any deployed cloudstack that matches the project

* `aws cloudformation describe-stacks --stack-name GateStaticWebsiteS3`
  * If **deployed**: returns JSON with the stack status (CREATE_COMPLETE, UPDATE_COMPLETE, etc.) and the WebsiteURL output
  * If **not deployed**: returns an error: Stack with id GateStaticWebsiteS3 does not exist


## Trouble Shoot
* `aws sts get-caller-identity` check the logged in account in the CLI
