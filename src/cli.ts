#!/usr/bin/env node

import * as program from 'commander';
import * as fs from "fs";
import * as path from "path";

import { HealthChecker } from './health-checker';
import { HCHtmlReporter } from './reporter/hc-html-reporter';
import { HCJunitReporter } from './reporter/hc-junit-reporter';
import { HCJsonReporter } from './reporter/hc-json-reporter';
import { HCLogger } from './services/hc-logger';
import { HCMailNotifier } from './services/hc-mail-notifier';
import { HCSlackNotifier } from './services/hc-slack-notifier';
import { HCConfig } from './model/hc-config';

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
            .option('-p, --param <name>=<value>', 'set variable from cli, has top most priorty', this.param, {})
            .action((configFile, cmd) => this.action(configFile, this))
            .parse(process.argv);

        if (!this.configFile) {
            program.help();
        }
    }

    private param(val: any, memo: any) {
        const parama = val.split('=');
        memo[parama[0]] = parama[1];
        return memo;
    }

    private action(configFile: string, instance: Cli) {
        instance.configFile = configFile;

        HCLogger.trace = program.trace || false;
        instance.reportJson = this.getReportPath(program.json, './hc-report.json');
        instance.reportHtml = this.getReportPath(program.html, './hc-report.html');
        instance.reportJunit = this.getReportPath(program.junit, './hc-report.junit.xml');

        if(instance.configFile !== null && instance.configFile !== undefined) {
            const healthChecker = HealthChecker.load(instance.configFile);
            instance.handleParams(program, healthChecker.context.config);

            healthChecker.check().then((context) => {

                new HCMailNotifier().notify(context);

                new HCSlackNotifier().notify(context);

                if (instance.reportHtml) {
                    HCLogger.info('Creating html report: ' + instance.reportHtml);
                    new HCHtmlReporter().render(context, this.createFolder(instance.reportHtml));
                }

                if (instance.reportJson) {
                    HCLogger.info('Creating json report: ' + instance.reportJson);
                    new HCJsonReporter().render(context, this.createFolder(instance.reportJson));
                }

                if (instance.reportJunit) {
                    HCLogger.info('Creating junit report: ' + instance.reportJunit);
                    new HCJunitReporter().render(context, this.createFolder(instance.reportJunit));
                }
      
                process.exitCode = context.report.allHealthy ? 0 : 1;
            });
        }
    }

    private handleParams(program: any, config: HCConfig) {
        if(program.param) {
            Object.keys(program.param).forEach(p => {
                config.variables.set(p, program.param[p]);
            })
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
