
import * as nodemailer from 'nodemailer';
import { HCContext } from "../model/hc-context";
import { HCHtmlReporter } from "../reporter/hc-html-reporter";
import { HCLogger } from "./hc-logger";
import { HCConfig } from "src/model/hc-config";
import { HCNotifier } from './hc-notifier';

export class HCMailNotifier implements HCNotifier {

  constructor() { }

  public notify(context: HCContext): void {

    const emailContent = new HCHtmlReporter().renderString(context);

    const mailOptions = {
      from: context.config.mail.sender,
      to: context.config.mail.recipients,
      subject: 'health-checker ' + (context.report.allHealthy ? 'HEALTHY' : 'UNHEALTHY'),
      html: emailContent
    };

    const transporter = this.createTransporter(context.config);

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        HCLogger.error(error, true);
      } else {
        HCLogger.info('Email sent: ' + info.response);
      }
    });
  }

  private createTransporter(config: HCConfig): nodemailer.Transporter {
    const transporter = nodemailer.createTransport(config.mail.server);
    transporter.verify(function (error, success) {
      if (error) {
        HCLogger.error(error, true);
      } else {
        HCLogger.info('Server is ready to take our messages.');
      }
    });

    return transporter;
  }
}