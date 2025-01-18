import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import * as nodemailer from 'nodemailer';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import * as fs from 'node:fs';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Votre adresse Gmail
        pass: process.env.GMAIL_PASS, // Mot de passe de l'application ou mot de passe Gmail
      },
    });
  }
  async sendEmail(sentTo: string[], subject: string, text: string) {
    const mailOptions = {
      from: `Linkit" <${process.env.GMAIL_USER}>`,
      to: sentTo,
      subject: subject,
      html: text,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email', error);
      return error;
    }
    return null;
  }
  private async getTemplateByName(
    templateName: string,
    data: Record<string, any>,
  ) {
    const templatePath = path.join(
      'src',
      'templates',
      `${templateName}.template.html`,
    );
    console.log(templatePath);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    return template(data);
  }
  async sendEmailWithTemplate(
    sentTo: string[],
    subject: string,
    template: string,
    data: Record<string, any>,
  ) {
    const html = await this.getTemplateByName(template, data);
    return await this.sendEmail(sentTo, subject, html);
  }
}
