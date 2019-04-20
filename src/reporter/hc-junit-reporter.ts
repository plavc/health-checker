import { HCContext } from '../model/hc-context';

const builder = require('junit-report-builder');

export class HCJunitReporter {

    public render(context: HCContext, outFileName: string) {

        var suite = builder.testSuite().name('health-checker-report');
        
        context.config.services.forEach(service => {
            var testCase = suite.testCase()
                .className(service.name)
                .name(service.renderedUrl);

            if (service.state) {
                if (service.state.responseTime) {
                    testCase.time(service.state.responseTimeSeconds)
                }

                if (!service.state.healthy) {
                    testCase.failure('Expected status: ' + service.successStatus + ', response status: ' + service.state.status); 
                }
            }
        });
        
        builder.writeTo(outFileName);
    }
}