import { Service, Event, FieldGroup } from '../../../shared/Workflow';

export const EventTimeOfDayReached: Event = {
    type: "action",
    id_node: "timeOfDayReached",
    name: "Specific Time of Day Reached",
    description: "Trigger when a specific time of day is reached.",
    serviceName: "timer",
    fieldGroups: [
        {
            id: "timeDetails",
            name: "Time Details",
            description: "Details of the time to check",
            type: "group",
            fields: [
                {
                    id: "hour",
                    type: "number",
                    required: true,
                    description: "Hour (24-hour format)",
                },
                {
                    id: "minute",
                    type: "number",
                    required: true,
                    description: "Minute",
                },
            ],
        },
    ],
    check: async (parameters: FieldGroup[]) => {
        const timeDetails = parameters.find(p => p.id === "timeDetails");

        if (!timeDetails) {
            throw new Error("Missing 'timeDetails' in parameters.");
        }

        const hour = timeDetails.fields.find(f => f.id === "hour")?.value;
        const minute = timeDetails.fields.find(f => f.id === "minute")?.value;

        if (hour == null || minute == null) {
            throw new Error("'hour' and 'minute' are required fields.");
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        return currentHour === hour && currentMinute === minute;
    },
};

export const EventPomodoroCycleComplete: Event = {
    type: "action",
    id_node: "pomodoroCycleComplete",
    name: "Pomodoro Cycle Complete",
    description: "Trigger when a Pomodoro cycle is complete.",
    serviceName: "timer",
    fieldGroups: [
        {
            id: "cycleDetails",
            name: "Cycle Details",
            description: "Details for the Pomodoro cycle",
            type: "group",
            fields: [
                {
                    id: "duration",
                    type: "number",
                    required: true,
                    description: "Duration of the Pomodoro cycle in minutes",
                },
            ],
        },
    ],
    check: async (parameters: FieldGroup[]) => {
        const cycleDetails = parameters.find(p => p.id === "cycleDetails");

        if (!cycleDetails) {
            throw new Error("Missing 'cycleDetails' in parameters.");
        }

        const duration = cycleDetails.fields.find(f => f.id === "duration")?.value;

        if (duration == null) {
            throw new Error("'duration' is a required field.");
        }

        const startTime = new Date().getTime();
        const endTime = startTime + duration * 60 * 1000;

        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                console.log(`Pomodoro cycle of ${duration} minutes completed.`);
                resolve(true);
            }, duration * 60 * 1000);
        });
    },
};

export const TimerService: Service = {
    id: "timer",
    name: "Timer Service",
    description: "Service to handle events based on time",
    loginRequired: false,
    image: "https://www.svgrepo.com/show/532140/timer.svg",
    Event: [EventTimeOfDayReached, EventPomodoroCycleComplete],
};
