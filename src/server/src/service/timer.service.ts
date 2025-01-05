import { Service, Event, FieldGroup } from '../../../shared/Workflow';

export const EventDateReached: Event = {
    type: "action",
    id_node: "dateReached",
    name: "Date Reached",
    description: "Trigger when a specific date and time is reached.",
    serviceName: "timer",
    fieldGroups: [
        {
            id: "dateDetails",
            name: "Date Details",
            description: "Details of the target date and time",
            type: "group",
            fields: [
                {
                    id: "targetDate",
                    type: "string",
                    required: true,
                    description: "The target date and time in ISO format (e.g., '2025-01-03T15:00:00Z').",
                },
            ],
        },
    ],
    check: async (parameters: FieldGroup[]) => {
        const dateDetails = parameters.find(p => p.id === "dateDetails");

        if (!dateDetails) {
            throw new Error("Missing 'dateDetails' in parameters.");
        }

        const targetDateStr = dateDetails.fields.find(f => f.id === "targetDate")?.value;

        if (!targetDateStr) {
            throw new Error("'targetDate' is a required field.");
        }

        const targetDate = new Date(targetDateStr);
        if (isNaN(targetDate.getTime())) {
            throw new Error("'targetDate' is not a valid ISO format.");
        }

        const now = new Date();
    
        const oneMinuteAfterTarget = new Date(targetDate.getTime() + 60 * 1000);
        if (now >= targetDate && now < oneMinuteAfterTarget) {
            console.log(`Target date reached: ${targetDate.toISOString()} (within 1 minute).`);
            return true;
        }
        return false;
    },
};


export const TimerService: Service = {
    id: "timer",
    name: "Timer Service",
    description: "Service to handle events based on time",
    loginRequired: false,
    image: "https://www.svgrepo.com/show/532140/timer.svg",
    Event: [],
};
