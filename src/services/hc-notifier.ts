import { ServiceInfo } from "../model/service-info";

import * as nodemailer from 'nodemailer';
import { HCContext } from "../model/hc-context";


export interface ServiceHealthNotifier {

    notify(serviceInfo: ServiceInfo): void;

}


export class ServiceHealthMailNotifier implements ServiceHealthNotifier {


    constructor(transporter: any, context: HCContext) { }

    private transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
      }
    });
    
    mailOptions = {
      from: 'youremail@gmail.com',
      to: 'myfriend@yahoo.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
    };

    public notify(serviceInfo: ServiceInfo): void {

        this.transporter.sendMail(this.mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }

}