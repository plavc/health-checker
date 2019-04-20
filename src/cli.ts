#!/usr/bin/env node

import * as program from 'commander';
import { HealthChecker } from './health-checker';
import { HCHtmlReporter } from './reporter/hc-html-reporter';
import { HCJunitReporter } from './reporter/hc-junit-reporter';
import { HCJsonReporter } from './reporter/hc-json-reporter';
import * as fs from "fs";
import * as path from "path";
import { Logger } from './services/logger';

class Cli {

    public configFile?: string;
    public reportJson?: string;
    public reportHtml?: string;
    public reportJunit?: string;

    public run() {

        program
            .name('pl-health-checker')
            .version(require('../package.json').version, '-v, --version')
            .description(require('../package.json').description)
            .arguments('<configFile>')
            .option('-J, --json [outDir]', 'outputs json report, default: hc-report.json')
            .option('-H, --html [outDir]', 'outputs html report, default: hc-report.html')
            .option('-U, --junit [outDir]', 'outputs junit report, default: hc-report.junit.xml')
            .option('-t, --trace', 'print report to standard output')
            .action((configFile, cmd) => this.action(configFile, this))
            .parse(process.argv);

        if (!this.configFile) {
            program.help();
        }
    }

    private action(configFile: string, instance: Cli) {
        instance.configFile = configFile;

        Logger.trace = program.trace || false;
        instance.reportJson = this.getReportPath(program.json, './hc-report.json');
        instance.reportHtml = this.getReportPath(program.html, './hc-report.html');
        instance.reportJunit = this.getReportPath(program.junit, './hc-report.junit.xml');

        if(instance.configFile !== null && instance.configFile !== undefined) {
            HealthChecker.load(instance.configFile).check().then((context) => {

                if (instance.reportHtml) {
                    Logger.info('Creating html report: ' + instance.reportHtml);
                    new HCHtmlReporter().render(context, this.createFolder(instance.reportHtml));
                }

                if (instance.reportJson) {
                    Logger.info('Creating json report: ' + instance.reportJson);
                    new HCJunitReporter().render(context, this.createFolder(instance.reportJson));
                }

                if (instance.reportJunit) {
                    Logger.info('Creating junit report: ' + instance.reportJunit);
                    new HCJsonReporter().render(context, this.createFolder(instance.reportJunit));
                }
      
                process.exitCode = context.report.allHealthy ? 0 : 1;
            });
        }
    }

    private getReportPath(report: string | boolean | undefined, defaultPath: string): string | undefined {
        if (typeof report === 'boolean') {
            return defaultPath;
        } else if (typeof report === 'string') {
            return report;
        } else {
            return undefined;
        }
    }

    private createFolder(fileName: string) {
        const folder = path.dirname(fileName);
        const folders = folder.replace(path.sep, '/').split('/');

        if (folders.length > 0) {
            folders.forEach(f => {
                if (!fs.existsSync(f)) {
                    fs.mkdirSync(f);
                }
            })
        }

        return fileName;
    }
}

new Cli().run();


/*
import { HealthChecker } from "./health-checker";
import { HCHtmlReporter } from "./reporter/hc-html-reporter";
import { HCJunitReporter } from "./reporter/hc-junit-reporter";
import { HCJsonReporter } from "./reporter/hc-json-reporter";
import { HCContext } from './model/hc-context';

class Cli {
    
    public static main() {

        HealthChecker.load(this.getYamlFileName()).check().then((context) => {

            const reporter = new HCHtmlReporter();
            reporter.render(context, './src/templates/report.template.html', './out-report.html');

            const junitReporter = new HCJunitReporter();
            junitReporter.render(context, './out-report.xml');

            const jsonReporter = new HCJsonReporter();
            jsonReporter.render(context, './out-report.json');

            process.exitCode = context.report.allHealthy ? 0 : 1;
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
*/