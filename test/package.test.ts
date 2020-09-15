import deploy, { output, pkg } from "../index";

import * as path from "path";

test("deploy", done => {
  deploy(
    {
      region: "eu-west-2",
      stackName: "package-test",
      templateFile: path.join("test", "templates", "package", "bucket.yaml"),
      capabilities: ["CAPABILITY_IAM"],
      parameters: {
        CustomTag: "test",
        CustomTag2: "test2"
      }
    },
    chunk => console.log(chunk)
  ).then(done);
}, 200000);

test("package", async () => {
  await pkg(
    {
      region: "eu-west-2",
      templateFile: path.join("test", "templates", "package", "index.yaml"),
      outputTemplateFile: path.join("out.yaml"),
      useJson: false,
      s3Bucket: ((await output("package-test", "eu-west-2")) as any)
        .StacksBucket,
      s3Prefix: "test",
      metadata: {
        CustomTag: "test",
        CustomTag2: "test2"
      }
    },
    chunk => console.log(chunk)
  );
});
