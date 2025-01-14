import { PrismaService } from '../prisma/prisma.service';
import fetch from 'node-fetch';

export class OutlookTools {
  constructor(private prisma: PrismaService) {}

  async sendEmail(
    userId: string,
    recipientEmail: string,
    subject: string,
    message: string,
  ) {
    console.log('Sending email with the following details:');
    console.log('Recipient:', recipientEmail);
    console.log('Subject:', subject);
    console.log('Message:', message);

    const accessToken = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userId, provider: 'outlook' } },
      select: { accessToken: true },
    });

    if (!accessToken) {
        console.log('accessToken not found');
        throw new Error('Access token not found');
    }
    console.log('accessToken', accessToken);

    const body = {
      message: {
        subject: subject,
        body: {
          contentType: 'Text',
          content: message,
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipientEmail,
            },
          },
        ],
      },
    };

    console.log('Email body:', JSON.stringify(body));

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Failed to send email. Status: ${response.status}`,
          errorBody,
        );
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }

  async createDraft(
    userId: string,
    recipientEmail: string,
    subject: string,
    message: string,
  ) {

    const accessToken = await this.prisma.token.findUnique({
        where: { userId_provider: { userId: userId, provider: 'outlook' } },
        select: { accessToken: true },
        });

    if (!accessToken) {
        console.log('accessToken not found');
        throw new Error('Access token not found');
    }
    console.log('accessToken', accessToken);

    const body = {
        subject: subject,
        body: {
          contentType: 'Text',
          content: message,
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipientEmail,
            },
          },
        ],
        isDraft: true,
      };
  
      console.log('Draft body:', JSON.stringify(body));
  
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Failed to create draft. Status: ${response.status}`, errorBody);
          throw new Error(`Failed to create draft: ${response.statusText}`);
        }
  
        const draft = await response.json();
        console.log('Draft created successfully:', draft);
        return draft;
      } catch (error) {
        console.error('Error creating draft:', error.message);
        throw error;
      }
  }
}
