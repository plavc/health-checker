import * as Mustache from 'mustache';
import { HCContext } from '../model/hc-context';

import * as fs from "fs";
import * as path from 'path';
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

    constructor() { }

    public render(context: HCContext, outFileName: string, templateFileName: string = 'src/templates/report.mustache') {
        this.saveReport(outFileName, this.renderString(context, templateFileName));
    }

    public renderString(context: HCContext, templateFileName: string = 'src/templates/report.mustache'): string {
        return Mustache.render(
            this.getTemplate(templateFileName), new HCHtmlReporterWrapper(context.report, context.config.services, context.config),
            this.loadSharedPartials(path.dirname(templateFileName)));
    }

    private getTemplate(templateFileName: string): string {
        return fs.readFileSync(templateFileName, { encoding: 'UTF-8' });
    }

    private saveReport(fileName: string, content: string) {
        fs.writeFileSync(fileName, content);
    }

    private loadSharedPartials(folder: string) {
        let partials: any = { };
      
        var files = fs.readdirSync(folder);
      
        for (var i = 0, l = files.length; i < l; i++) {
          var file = files[i];
      
          if (file.match(/\.partial\.mustache$/)) {
            var name = path.basename(file, '.partial.mustache');
            partials[name] = fs.readFileSync(folder + '/' + file, { encoding: 'utf8' });
          }
        }
      
        return partials;
    }
}