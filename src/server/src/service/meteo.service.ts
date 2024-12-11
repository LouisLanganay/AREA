import {Service, Event, FieldGroup} from '../../../shared/Workflow';
import {MailerService} from "../mailer/mailer.service";

export const EventSendMail: Event = {
    type: "reaction",
    id_node: "sendEmail",
    name: "send mail",
    description: "send an email",
    serviceName: "testService",
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

export const EventCheckFreezingTemperature: Event = {
    type: "action",
    id_node: "checkFreezingTemperature",
    name: "Check Freezing Temperature",
    description: "Check if the temperature is below 0°C using Open-Meteo",
    serviceName: "testService",
    fieldGroups: [
        {
            id: "locationDetails",
            name: "Location Details",
            description: "Details of the location to check",
            type: "group",
            fields: [
                {id: "latitude", type: "number", required: true, description: "Latitude of the location"},
                {id: "longitude", type: "number", required: true, description: "Longitude of the location"}
            ]
        }
    ],
    check: async (parameters: FieldGroup[]) => {
        const locationDetails = parameters.find(p => p.id === "locationDetails");

        if (!locationDetails) {
            throw new Error("Missing 'locationDetails' in parameters.");
        }

        const latitude = locationDetails.fields.find(f => f.id === "latitude")?.value;
        const longitude = locationDetails.fields.find(f => f.id === "longitude")?.value;

        if (latitude == null || longitude == null) {
            throw new Error("'latitude' and 'longitude' are required fields.");
        }

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            if (!response.ok) {
                throw new Error(`Failed to fetch weather data: ${response.statusText}`);
            }
            const data = await response.json();
            const temperature = data?.current_weather?.temperature;

            console.log(`Temperature at location (${latitude}, ${longitude}): ${temperature}°C`);
            return temperature < 10;
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            throw error;
        }
    }
};

export const TestService: Service = {
    id: "testService",
    name: "Test Service",
    description: "A service for testing purposes",
    loginRequired: false,
    Event: []
};
