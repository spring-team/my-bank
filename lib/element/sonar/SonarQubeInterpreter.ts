import { CodeInspectionRegisteringInterpreter, Interpretation } from "@atomist/sdm-pack-analysis";
import { AutoInspectRegistration, SdmContext } from "@atomist/sdm";
import { sonarQubeReviewer, SonarQubeSupportOptions } from "./sonarQubeReviewer";

/**
 * Perform SonarQube scanning.
 */
export class SonarQubeInterpreter implements CodeInspectionRegisteringInterpreter {

    public readonly codeInspections: Array<AutoInspectRegistration<any, any>>;

    public async enrich(interpretation: Interpretation, sdmContext: SdmContext): Promise<boolean> {
        // We always return true
        interpretation.inspections.push(...this.codeInspections);
        return true;
    }

    constructor(private readonly options: SonarQubeSupportOptions) {
        this.codeInspections = [sonarQubeReviewer(this.options)];
    }
}
