
import { HCContext } from "../model/hc-context";

import axios from 'axios';
import { HCConfig } from "../model/hc-config";
import { HCSlackMessageBuilder } from "./hc-slack-message-builder";
import { HCNotifier } from "./hc-notifier";

export class HCSlackNotifier implements HCNotifier {

    private messageBuilder = new HCSlackMessageBuilder();

    notify(context: HCContext): void {
        if (context) {

            if (!context.config.slack.enabled || (context.report.allHealthy && !context.config.slack.healthy)) {
                return;
            }

            this.sendMessage(context.config, this.messageBuilder.build(context));
        };
    }

    public async sendMessage(config: HCConfig, data: object): Promise<any> {

        try {
            const response = await axios.request({
                method: 'POST',
                url: config.slack.webhook,
                responseType: 'json',
                headers: {'Content-type': 'application/json' },
                data: data
            });
        
        } catch(e) {
            console.log(e);
        }
    }
}