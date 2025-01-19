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

    const token = await this.prisma.token.findUnique({
      where: { userId_provider: { userId: userId, provider: 'outlook' } },
      select: { accessToken: true },
    });

    if (!token.accessToken) {
        console.log('accessToken not found');
        throw new Error('Access token not found');
    }

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

      const url = `${redirect}/webhooks/outlook/${createWebHook.id}`;
      try {
        const subscription = await this.createEmailSubscription(userId, url);
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

    const body = {
      changeType: 'created',
      notificationUrl: notificationUrl,
      resource: "/me/mailFolders('inbox')/messages",
      expirationDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      clientState: 'secureClientState',
    };

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
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error.message);
      throw error;
    }
  }
}
