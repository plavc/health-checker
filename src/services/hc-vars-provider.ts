
import { HCLogger } from "./hc-logger";
import { HCConfig } from "../model/hc-config";

export class HCVarsProvider {

    constructor(private config: HCConfig) { }

    public substitute(source: string): string {

        let vars: string[] = [];

        this.findNextVariable(source, 0, vars);

        vars.forEach(variable => {
            let value: string | undefined;

            if (variable.startsWith('env.')) {
                value = process.env[variable.substring(4)];
            } else {
                value = this.config.variables.get(variable);
            }
            
            if (value) {
                source = source.replace('${' + variable + '}', value);
            } else {
                HCLogger.error('Cannot substitute variable: ' + variable);
            }
        });
    
        return source;
    }

    private findNextVariable(source: string, searchStartIndex: number, vars: string[]): void {
        if (searchStartIndex >= source.length - 2) {
            return;
        }

        let tmpVar: string;
        let varStart = source.indexOf('${', searchStartIndex);

        if (varStart === -1) {
            return;
        }

        varStart += 2;

        let varEnd = source.indexOf('}', varStart);

        if (varEnd === -1) {
            HCLogger.error('Invalid parametrized string: ' + source);
        }

    	vars.push(source.substring(varStart, varEnd));

        this.findNextVariable(source, varEnd, vars);
    }
}