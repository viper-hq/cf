import deploy, { output } from "../index";

import * as path from "path";

test("deploy", done => {
  deploy(
    {
      region: "eu-west-2",
      stackName: "test",
      templateFile: path.join("test", "templates", "bucket.yaml"),
      capabilities: ["CAPABILITY_IAM"],
      parameters: {
        CustomTag: "test",
        CustomTag2: "test2"
      }
    },
    chunk => console.log(chunk)
  ).then(done);
}, 200000);

test("update", done => {
  deploy(
    {
      region: "eu-west-2",
      stackName: "test",
      templateFile: path.join("test", "templates", "bucket.yaml"),
      capabilities: ["CAPABILITY_IAM"],
      parameters: {
        CustomTag: "test",
        CustomTag2: "test3"
      }
    },
    chunk => console.log(chunk)
  ).then(done);
}, 200000);

test("rollback", done => {
  deploy(
    {
      region: "eu-west-2",
      stackName: "test",
      templateFile: path.join("test", "templates", "bucket.yaml"),
      capabilities: ["CAPABILITY_IAM"],
      parameters: {
        CustomTag: "test",
        CustomTag2: "test2"
      }
    },
    chunk => console.log(chunk)
  ).then(done);
}, 200000);

test("output", done => {
  output("test", "eu-west-2").then((params: any) => {
    expect(params.Output1).toBe("Output1");
    done();
  });
}, 200000);
