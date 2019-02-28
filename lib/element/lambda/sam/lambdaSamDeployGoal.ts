/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    asSpawnCommand,
    LocalProject,
} from "@atomist/automation-client";
import {
    goal,
    Goal,
    spawnLog,
    SpawnLogOptions,
} from "@atomist/sdm";

// tslint:disable

/**
 * Deploy using Lambda SAM. Requires AWS and SAM cli installed locally
 * and correct credentials set for them
 * @return {Goal}
 */
export function lambdaSamDeployGoal(): Goal {
    return goal({
        displayName: "deployLambda",
    }, async gi => {
        return gi.configuration.sdm.projectLoader.doWithProject({
            id: gi.id,
            credentials: gi.credentials,
            readOnly: true,
        }, async p => {
            const stackName = p.id.repo;
            // TODO what about the bucket?? and consider S3 prefix
            const s3Bucket = "com.atomist.hello";
            // TODO strip path
            const packageCommand = `/Users/rodjohnson/Library/Python/3.7/bin/sam package --template-file template.yml --s3-bucket ${s3Bucket} --output-template-file packaged-template.yml`;
            const deployCommand = `/Users/rodjohnson/Library/Python/3.7/bin/sam deploy --template-file packaged-template.yml --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
            const cmd1 = asSpawnCommand(packageCommand);
            const cmd2 = asSpawnCommand(deployCommand);

            const opts: SpawnLogOptions = { log: gi.progressLog, cwd: (p as LocalProject).baseDir };

            // TODO handle error responses, need to parse them
            await spawnLog(cmd1.command, cmd1.args, opts);
            await spawnLog(cmd2.command, cmd2.args, opts);

            // await gi.addressChannels("Update: " + JSON.stringify(update));
        });
    });
}
