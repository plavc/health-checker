import { HCContext } from "../model/hc-context";
import { ServiceInfoHealth } from "../model/service-info-health";

export class HCSlackMessageBuilder {

    public build(context: HCContext) {
        let message: any = {
            blocks: []
        }

        if(context.report.allHealthy) {
            message.blocks = this.prepareMessageSuccessful(context);
        } else {
            message.blocks = this.prepareMessageFailed(context);
        }

        return message;
    }

    private prepareMessageSuccessful(context: HCContext) {
        return [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*HEALTHY* :sunny: | healthy: *${context.report.countSuccessful}* | unhealthy: *${context.report.countFailed}*`
                }
            }
        ];
    }

    private prepareMessageFailed(context: HCContext) {

        let sunnyIcon = context.report.countSuccessful > 0 ? ':partly_sunny:': ':zap:';

        let messsageBlocks: object[] = [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*UNHEALTHY* ${sunnyIcon} | healthy: *${context.report.countSuccessful}* | unhealthy: *${context.report.countFailed}*`
                }
            }
        ];

        if (context.config.slack.fullReport) {
          this.prepareDetailedMessage(context, messsageBlocks);
        }

        return messsageBlocks;
    }

    private prepareDetailedMessage(context: HCContext, messsageBlocks: object[]) {
        messsageBlocks.push(
            {
                type: 'divider'
            }
        );

        context.config.services.forEach(s => {
            let status: string = '';
            const state = s.state || new ServiceInfoHealth(false, 0, undefined, undefined);
            status = state.healthy ? ':ok:' : ':red_circle:'
            
            messsageBlocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `${status} <${s.renderedUrl}|${s.name}> |  status: *${state.status}*, time: *${state.responseTimeMillis}* ms`
                }
            })
        });
    }

}