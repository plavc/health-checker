#!/usr/bin/env node

import { HealthChecker } from "./health-checker";

class Cli {
    
    public static main() {

        HealthChecker.load(this.getYamlFileName()).check().then((context) => {
            process.exitCode = context.healthy ? 0 : 1;
        });
    }

    private static getYamlFileName(): string {
        const args: string[] = process.argv.slice(2);
        if (args.length === 0) {
            throw new Error('Configuration file not provided.')
        }

        return args[0];
    }
}

Cli.main();