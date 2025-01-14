import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import fetch from 'node-fetch';

export class OutlookTools {
    private readonly prismaService: PrismaService = new PrismaService();
    private readonly userService: UsersService = new UsersService(
      this.prismaService,
    );
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

    const token = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userId, provider: 'outlook' } },
      select: { accessToken: true },
    });

    if (!token.accessToken) {
        console.log('accessToken not found');
        throw new Error('Access token not found');
    }
    console.log('accessToken', token.accessToken);

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
          Authorization: `Bearer ${token.accessToken}`,
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
      console.log('Email sent successfully');
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

    const token = await this.prisma.token.findUnique({
        where: { userId_provider: { userId: userId, provider: 'outlook' } },
        select: { accessToken: true },
        });

    if (!token.accessToken) {
        console.log('accessToken not found');
        throw new Error('Access token not found');
    }
    console.log('accessToken', token.accessToken);

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
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`Failed to create draft. Status: ${response.status}`, errorBody);
          throw new Error(`Failed to create draft: ${response.statusText}`);
        }
  
        console.log('Draft created successfully:');
      } catch (error) {
        console.error('Error creating draft:', error.message);
        throw error;
      }
  }

  async createWebhook(userId: string, workflowId: string) {
    const redirect = process.env.IP_BACK;

    const createWebHook = await this.userService.createWebhook(userId, {
        workflowId,
        channelId: 'outlook',
        service: 'outlook',
      });
      if (!createWebHook) {
        return false;
      }

      const url = `${redirect}/webhooks/${createWebHook.id}`;
      try {
        const subscription = await this.createEmailSubscription(userId, url);
        console.log('Subscription created successfully:', subscription);
        return false;
      } catch (error) {
        console.error('Error creating subscription:', error.message);
        throw error;
      }
  }

  async createEmailSubscription(userId: string, notificationUrl: string) {
    const token = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userId, provider: 'outlook' } },
      select: { accessToken: true },
    });

    if (!token || !token.accessToken) {
      console.error('Access token not found for user:', userId);
      throw new Error('Access token not found');
    }

    console.log('Using access token for subscription:', token.accessToken);

    const body = {
      changeType: 'created,updated',
      notificationUrl: notificationUrl,
      resource: "/me/mailFolders('inbox')/messages",
      expirationDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 heure d'expiration
      clientState: 'secureClientState',
    };

    console.log('Subscription request body:', JSON.stringify(body));

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 201) {
        const errorBody = await response.text();
        console.error('Failed to create subscription:', errorBody);
        throw new Error(`Subscription failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Subscription created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error.message);
      throw error;
    }
  }
}
