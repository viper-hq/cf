# CloudFormation helper functions

[![npm](https://img.shields.io/npm/v/@viperhq/cf.svg)](https://www.npmjs.com/package/@viperhq/cf)

### Running deploy

Full parameter list:
https://docs.aws.amazon.com/cli/latest/reference/cloudformation/deploy/index.html

```JavaScript
deploy({
  region: "eu-west-2",
  stackName: "test",
  templateFile: path.join("test", "templates", "bucket.yaml"),
  capabilities: ["CAPABILITY_IAM"],
  parameters: {
    CustomTag: "test",
    CustomTag2: "test2"
  }
})
```

### Getting outputs

```JavaScript
const outputs = await output("test", "eu-west-2");
```
