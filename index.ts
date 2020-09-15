import exec from "@viperhq/exec";
import * as mkdirp from "mkdirp";
import * as path from "path";

export interface DeployArgs {
  stackName: string;
  templateFile: string;
  region?: string;
  capabilities?: string[];
  notificationARNs?: string[];
  tags?: string[];
  s3Bucket?: string;
  s3Prefix?: string;
  s3ForceUpload?: boolean;
  kmsKeyId?: string;
  roleArn?: string;
  parameters?: {
    [key: string]: string | boolean | number;
  };
}

export interface PackageArgs {
  region?: string;
  templateFile: string;
  outputTemplateFile: string;
  s3Bucket: string;
  s3Prefix?: string;
  s3ForceUpload?: boolean;
  kmsKeyId?: string;
  useJson?: boolean;
  metadata?: {
    [key: string]: string | boolean | number;
  };
}

export async function output(
  stackName: string,
  region: string = process.env.AWS_DEFAULT_REGION,
  shell = "/bin/bash",
  execOpts: { [key: string]: any } = {}
): Promise<{}> {
  const e = exec(shell, arg => arg, execOpts);

  // prettier-ignore
  const p = e.async`
    aws cloudformation \
      --output json \
      --region "${region}" \
      describe-stacks \
      --stack-name "${stackName}" \
      --query "Stacks[0].Outputs"
  `;

  return new Promise((resolve, reject) => {
    let error = "";
    let result = "";
    p.stderr.on("data", chunk => (error += chunk));
    p.stdout.on("data", chunk => (result += chunk));
    p.on("exit", code => {
      if (code) {
        return reject(new Error(error));
      }
      resolve(
        JSON.parse(result).reduce((res, act) => {
          res[act.OutputKey] = act.OutputValue;
          return res;
        }, {})
      );
    });
  });
}

const defaultDeployArgs: () => DeployArgs = () => ({
  stackName: "",
  templateFile: "",
  region: process.env.AWS_DEFAULT_REGION
});

export default async function deploy(
  deployArgs: DeployArgs,
  logger = (_: string) => {},
  shell = "/bin/bash",
  execOpts: { [key: string]: any } = {}
): Promise<void> {
  const args = {
    ...defaultDeployArgs(),
    ...deployArgs
  };

  const e = exec(shell, arg => arg, execOpts);

  // prettier-ignore
  const p = e.async`
    aws cloudformation deploy \
      --region "${args.region}" \
      --no-fail-on-empty-changeset \
      --template-file "${args.templateFile}" \
      ${args.parameters && ` \
        --parameter-overrides ${Object.keys(args.parameters).map(arg => `"${arg}=${args.parameters[arg]}"`).join(" ")} \
      ` || ""} \
      ${args.s3Bucket && ` \
        --s3-bucket "${args.s3Bucket}" \
      ` || ""} \
      ${args.s3Prefix && ` \
        --s3-prefix "${args.s3Prefix}" \
      ` || ""} \
      ${args.s3ForceUpload && ` \
        --force-upload \
      ` || ""} \
      ${args.kmsKeyId && ` \
        --kms-key-id "${args.kmsKeyId}" \
      ` || ""} \
      ${args.roleArn && ` \
        --role-arn "${args.roleArn}" \
      ` || ""} \
      ${args.capabilities && args.capabilities.length && ` \
        --capabilities ${args.capabilities.map(arg => `"${arg}"`).join(" ")} \
      ` || ""} \
      ${args.notificationARNs && args.notificationARNs.length && ` \
        --notification-arns ${args.notificationARNs.map(arg => `"${arg}"`).join(" ")} \
      ` || ""} \
      ${args.tags && args.tags.length && ` \
        --tags ${args.tags.map(arg => `"${arg}"`).join(" ")} \
      ` || ""} \
      --stack-name "${args.stackName}"
  `;

  return new Promise((resolve, reject) => {
    let error = "";
    p.stderr.on("data", chunk => (error += chunk));
    p.stdout.on("data", logger);
    p.on("exit", code => {
      if (code) {
        return reject(new Error(error));
      }
      resolve();
    });
  });
}

const defaultPackageArgs: () => PackageArgs = () => ({
  templateFile: "",
  outputTemplateFile: "",
  s3Bucket: "",
  region: process.env.AWS_DEFAULT_REGION
});

export async function pkg(
  packageArgs: PackageArgs,
  logger = (_: string) => {},
  shell = "/bin/bash",
  execOpts: { [key: string]: any } = {}
): Promise<void> {
  const args = {
    ...defaultPackageArgs(),
    ...packageArgs
  };

  const e = exec(shell, arg => arg, execOpts);

  await mkdirp(path.parse(args.outputTemplateFile).dir);

  // prettier-ignore
  const p = e.async`
    aws cloudformation package \
      --region "${args.region}" \
      --template-file "${args.templateFile}" \
      --output-template-file "${args.outputTemplateFile}" \
      ${args.metadata && ` \
        --metadata ${Object.keys(args.metadata).map(arg => `"${arg}=${args.metadata[arg]}"`).join(",")} \
      ` || ""} \
      ${args.s3Bucket && ` \
        --s3-bucket "${args.s3Bucket}" \
      ` || ""} \
      ${args.s3Prefix && ` \
        --s3-prefix "${args.s3Prefix}" \
      ` || ""} \
      ${args.useJson && ` \
        --use-json \
      ` || ""} \
      ${args.s3ForceUpload && ` \
        --force-upload \
      ` || ""} \
      ${args.kmsKeyId && ` \
        --kms-key-id "${args.kmsKeyId}" \
      ` || ""}
  `;

  return new Promise((resolve, reject) => {
    let error = "";
    p.stderr.on("data", chunk => (error += chunk));
    p.stdout.on("data", logger);
    p.on("exit", code => {
      if (code) {
        return reject(new Error(error));
      }
      resolve();
    });
  });
}
