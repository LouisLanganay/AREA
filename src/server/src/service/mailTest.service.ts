import {Service, Event, FieldGroup} from '../../../shared/Workflow';
import {MailerService} from "../mailer/mailer.service";

export const EventSendMail: Event = {
    type: "reaction",
    id_node: "sendEmail",
    name: "Send Mail",
    description: "Send an email to a list of recipients",
    serviceName: "mailTest",
    fieldGroups: [
        {
            id: "email_info",
            name: "Email Information",
            description: "Details for sending the email",
            type: "group",
            fields: [
                {
                    id: "recipient_emails",
                    type: "string",
                    required: true,
                    description: "Comma-separated list of recipient emails",
                },
                {
                    id: "email_subject",
                    type: "string",
                    required: true,
                    description: "Subject of the email",
                },
                {
                    id: "email_body",
                    type: "string",
                    required: true,
                    description: "Body content of the email",
                },
            ],
        },
    ],
    execute: (parameters: FieldGroup[]) => {
        const mailerService = new MailerService();

        const emailGroup = parameters.find((group) => group.id === "email_info");

        if (!emailGroup) {
            console.error("Email information group not found");
            return;
        }

        const recipientEmailsField = emailGroup.fields.find((field) => field.id === "recipient_emails");
        const subjectField = emailGroup.fields.find((field) => field.id === "email_subject");
        const bodyField = emailGroup.fields.find((field) => field.id === "email_body");

        if (!recipientEmailsField || !subjectField || !bodyField) {
            console.error("Missing required email fields");
            return;
        }

        const recipientEmails = recipientEmailsField.value?.split(",") || [];
        const subject = subjectField.value;
        const body = bodyField.value;

        if (recipientEmails.length === 0 || !subject || !body) {
            console.error("Invalid email data. Cannot send email.");
            return;
        }

        try {
            mailerService.sendEmail(recipientEmails, subject, body);
            console.log("Email sent successfully");
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    }
}

export const MailTestService: Service = {
    id: "mailTest",
    name: "Mail Test Service",
    description: "Service to test sending emails",
    loginRequired: false,
    Event: []
};
