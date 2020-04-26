import exec from "@artit91/exec";

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

export async function output(
  stackName: string,
  region: string = process.env.AWS_DEFAULT_REGION,
  execOpts: { [key: string]: any } = {}
): Promise<{}> {
  const bash = exec("/bin/bash", arg => arg, execOpts);

  // prettier-ignore
  const p = bash.async`
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

const defaultArgs: () => DeployArgs = () => ({
  stackName: "",
  templateFile: "",
  region: process.env.AWS_DEFAULT_REGION
});

export default async function deploy(
  deployArgs: DeployArgs,
  logger = (_: string) => {},
  execOpts: { [key: string]: any } = {}
): Promise<void> {
  const args = {
    ...defaultArgs(),
    ...deployArgs
  };

  const bash = exec("/bin/bash", arg => arg, execOpts);

  // prettier-ignore
  const p = bash.async`
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
