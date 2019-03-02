import { InMemoryProject } from "@atomist/automation-client";
import { lambdaSamScanner } from "../../../../lib/element/lambda/sam/lambdaSamScanner";
import * as assert from "assert";
import { InMemoryFile } from "@atomist/automation-client/lib/project/mem/InMemoryFile";

describe("lambda SAM scanner", () => {

    it("should handle non-Lambda repo", async () => {
       const p = InMemoryProject.of();
       const lambda = await lambdaSamScanner(p, undefined, undefined, undefined);
       assert.strictEqual(lambda, undefined);
    });

    it("should handle Lambda repo", async () => {
        const p = InMemoryProject.of(new InMemoryFile("template.yml", Template1));
        const lambda = await lambdaSamScanner(p, undefined, undefined, undefined);
        assert.strictEqual(lambda.kind, "sam");
        assert.strictEqual(lambda.functions.length, 1);
        assert.strictEqual(lambda.functions[0].declarationName, "MyFunction");
        assert.strictEqual(lambda.functions[0].runtime, "nodejs6.10");

    });
});

const Template1 = `AWSTemplateFormatVersion: '2010-09-09'
Transform: 'AWS::Serverless-2016-10-31'
Resources:
  MyFunction:
    Type: 'AWS::Serverless::Function'
    Properties:
      Handler: index.handler
      Runtime: nodejs6.10
      CodeUri: 's3://my-bucket/function.zip'
`;
