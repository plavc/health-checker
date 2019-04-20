import * as Mustache from 'mustache';
import { HCContext } from '../model/hc-context';

import * as fs from "fs";
import { HCConfig } from 'src/model/hc-config';
import { ServiceInfo } from 'src/model/service-info';
import { HCReport } from 'src/model/hc-report';

class HCHtmlReporterWrapper {

    public timestamp = `${new Date()}`;

    constructor(
        public report: HCReport,
        public services: Array<ServiceInfo>,
        public config: HCConfig
    ) { }
}

export class HCHtmlReporter {

    constructor() {
    }

    public render(context: HCContext, outFileName: string, templateFileName: string = './src/templates/report.template.html') {
        const output = Mustache.render(this.getTemplate(templateFileName), new HCHtmlReporterWrapper(context.report, context.config.services, context.config));
        this.saveReport(outFileName, output);
    }

    private loadTemplate(templateFileName: string) {
        Mustache.parse(this.getTemplate(templateFileName), ['report-default']);
    }

    private getTemplate(templateFileName: string): string {
        return fs.readFileSync(templateFileName, { encoding: 'UTF-8' });
    }

    private saveReport(fileName: string, content: string) {
        fs.writeFileSync(fileName, content);
    }
}