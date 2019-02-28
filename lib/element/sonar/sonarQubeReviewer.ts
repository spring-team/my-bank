/*
 * Copyright © 2018 Atomist, Inc.
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
    isLocalProject,
    logger, Project,
    spawnAndWatch,
} from "@atomist/automation-client";
import {
    AutoCodeInspection,
    ReviewerRegistration, ReviewListenerRegistration,
    StringCapturingProgressLog,
    ToDefaultBranch,
} from "@atomist/sdm";

export interface SonarQubeSupportOptions {

    /**
     * Path to Sonar Scanner command
     */
    command?: string;

    enabled: boolean;
    url?: string;
    org?: string;
    token?: string;

    /**
     * Review listeners that let you publish review results.
     */
    reviewListeners?: ReviewListenerRegistration | ReviewListenerRegistration[];
}

/**
 * Add a temporary Sonar Qube project file to the project before invoking sonar-scanner
 * @param {SonarQubeSupportOptions} options
 * @return {ReviewerRegistration}
 */
export function sonarQubeReviewer(options: SonarQubeSupportOptions): ReviewerRegistration {
    return {
        name: "SonarQube review",
       // pushTest: ToDefaultBranch,
        inspection: async (project, pli) => {

            console.log("SONAR QUBE !!!!");

            if (!isLocalProject(project)) {
                throw new Error(`Can only perform review on local project: had ${project.id.url}`);
            }
            const command = [options.command || "sonar-scanner"];

            // Put in the temporary project properties file
            await project.addFile(
                "sonar-project.properties",
                await sonarProjectProperties(project));

            command.push(`-Dsonar.host.url=${options.url || "https://localhost:9000"}`);

            if (options.org) {
                command.push(`-Dsonar.organization=${options.org}`);
            }
            if (options.token) {
                command.push(`-Dsonar.login=${options.token}`);
            }

            const log = new StringCapturingProgressLog();
            await spawnAndWatch(
                asSpawnCommand(command.join(" ")),
                {
                    cwd: project.baseDir,
                },
                log,
            );
            await pli.addressChannels(`Code review success`);
            logger.info(log.log);
            const parsed = Pattern.exec(log.log);
            await pli.addressChannels(`Analysis will be available at ${parsed[0]}`);

            return {
                repoId: project.id,
                comments: [],
            };
        },
    };
}

// ANALYSIS SUCCESSFUL, you can browse https://sonarcloud.io/dashboard/index/com.atomist.springteam:spring-rest-seed
const Pattern = /ANALYSIS SUCCESSFUL, you can browse ([^\s^[]*)/;

async function sonarProjectProperties(p: Project): Promise<string> {
    // tslint:disable
    return `# must be unique in a given SonarQube instance
sonar.projectKey=${p.id.owner}:${p.id.owner}

# this is the name and version displayed in the SonarQube UI. Was mandatory prior to SonarQube 6.1.
# sonar.projectName=My project
# sonar.projectVersion=1.0
 
# Path is relative to the sonar-project.properties file. Replace "\\" by "/" on Windows.
# This property is optional if sonar.modules is set. 
sonar.sources=.
 
# Encoding of the source code. Default is default system encoding
#sonar.sourceEncoding=UTF-8
`;
}
