import { Service } from '../../../shared/Workflow';
import { Event, FieldGroup } from '../../../shared/Workflow';
import { OutlookTools } from './outlookTools.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaService = new PrismaService();
const outlookTools = new OutlookTools(prismaService);

export const EventSendEmail: Event = {
  type: 'reaction',
  id_node: 'sendEmail',
  name: 'Send Email',
  description: 'Send an email to a recipient using Outlook',
  serviceName: 'outlook',
  fieldGroups: [
    {
      id: 'emailDetails',
      name: 'Email Details',
      description: 'Details of the email to be sent',
      type: 'group',
      fields: [
        {
          id: 'recipientEmail',
          type: 'string',
          required: true,
          description: 'Email address of the recipient',
        },
        {
          id: 'subject',
          type: 'string',
          required: true,
          description: 'Subject of the email',
        },
        {
          id: 'message',
          type: 'string',
          required: true,
          description: 'Body of the email',
        },
      ],
    },
  ],
  execute: async (parameters: FieldGroup[]) => {
    const userId = parameters
        .find((group) => group.id === 'workflow_information')
        ?.fields.find((field) => field.id === 'user_id')?.value;

    if (!userId) {
      throw new Error("Missing 'user_id' in parameters.");
    }
    
    const emailDetails = parameters.find((p) => p.id === 'emailDetails');

    if (!emailDetails) {
      throw new Error("Missing 'emailDetails' in parameters.");
    }

    const recipientEmail = emailDetails.fields.find(
      (f) => f.id === 'recipientEmail',
    )?.value;
    const subject = emailDetails.fields.find((f) => f.id === 'subject')?.value;
    const message = emailDetails.fields.find((f) => f.id === 'message')?.value;

    if (!recipientEmail || !subject || !message) {
      throw new Error(
        "'recipientEmail', 'subject', and 'message' are required fields.",
      );
    }

    try {
      await outlookTools.sendEmail(userId, recipientEmail, subject, message);
    } catch (error) {
      console.error('Error in EventSendEmail:', error.message);
      throw error;
    }
  },
};

export const EventCreateEmailDraft: Event = {
  type: 'reaction',
  id_node: 'createEmailDraft',
  name: 'Create Email Draft',
  description: 'Create an email draft in Outlook',
  serviceName: 'outlook',
  fieldGroups: [
    {
      id: 'emailDetails',
      name: 'Email Details',
      description: 'Details of the email to save as a draft',
      type: 'group',
      fields: [
        {
          id: 'recipientEmail',
          type: 'string',
          required: true,
          description: 'Email address of the recipient',
        },
        {
          id: 'subject',
          type: 'string',
          required: true,
          description: 'Subject of the draft',
        },
        {
          id: 'message',
          type: 'string',
          required: true,
          description: 'Body of the email',
        },
      ],
    },
  ],
  execute: async (parameters: FieldGroup[]) => {
    const userId = parameters
        .find((group) => group.id === 'workflow_information')
        ?.fields.find((field) => field.id === 'user_id')?.value;

    if (!userId) {
      throw new Error("Missing 'user_id' in parameters.");
    }

    const emailDetails = parameters.find((p) => p.id === 'emailDetails');

    const recipientEmail = emailDetails?.fields.find(
      (f) => f.id === 'recipientEmail',
    )?.value;
    const subject = emailDetails?.fields.find((f) => f.id === 'subject')?.value;
    const message = emailDetails?.fields.find((f) => f.id === 'message')?.value;

    if (!recipientEmail || !subject || !message) {
      throw new Error(
        "'recipientEmail', 'subject', and 'message' are required fields.",
      );
    }

    try {
      const draft = await outlookTools.createDraft(userId, recipientEmail, subject, message);
      return draft;
    } catch (error) {
      console.error('Error creating draft in EventCreateEmailDraft:', error.message);
      throw error;
    }
  },
};

export const EventMonitorEmails: Event = {
  type: 'action',
  id_node: 'monitorEmails',
  name: 'Listen mailbox',
  description: 'Monitor incoming emails',
  serviceName: 'outlook',
  fieldGroups: [],
  check: async (parameters: FieldGroup[]) => {
    const userId = parameters
        .find((group) => group.id === 'workflow_information')
        ?.fields.find((field) => field.id === 'user_id')?.value;

    const workflowId = parameters
        .find((group) => group.id === 'workflow_information')
        ?.fields.find((field) => field.id === 'workflow_id')?.value;

    if (!userId || !workflowId) {
      throw new Error("Missing 'user_id' or 'workflowId' in parameters.");
    }
    try {
      const res = await outlookTools.createWebhook(userId, workflowId);
      return res;
    } catch (error) {
      console.error('Error creating webhook in EventMonitorEmails:', error.message);
      throw error;
    }
  }
};

export const OutlookService: Service = {
  id: 'outlook',
  name: 'Outlook Service',
  description: 'Service to send emails',
  loginRequired: true,
  image: 'https://www.svgrepo.com/show/533194/mail-alt.svg',
  Event: [],
  auth: {
    uri: '/auth/outlook/redirect',
    callback_uri: '/auth/outlook/callback',
  }
};
