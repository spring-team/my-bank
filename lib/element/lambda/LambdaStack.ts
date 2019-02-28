import { TechnologyElement } from "@atomist/sdm-pack-analysis";

/**
 * Superinterface for Lambda stack variants.
 */
export interface LambdaStack extends TechnologyElement {

    name: "lambda";

    kind: string;

    // TODO only one?
    functionName: string;

}
