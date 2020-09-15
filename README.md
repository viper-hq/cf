# CloudFormation helper functions

[![npm](https://img.shields.io/npm/v/@viperhq/cf.svg)](https://www.npmjs.com/package/@viperhq/cf)

### Running deploy

Full parameter list:
<https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/deploy/index.html>

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

### Running package

Full parameter list:
<https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/package.html>

```JavaScript
pkg({
  region: "eu-west-2",
  templateFile: "index.yaml",
  outputTemplateFile: "out.yaml",
  s3Bucket: "bucket"
})
```
