import { Service, Event, FieldGroup } from '../../../shared/Workflow';
import { PrismaService } from '../prisma/prisma.service';

export const EventDateReached: Event = {
  type: 'action',
  id_node: 'dateReached',
  name: 'Date Reached',
  description: 'Trigger when a specific date and time is reached.',
  serviceName: 'timer',
  fieldGroups: [
    {
      id: 'dateDetails',
      name: 'Date Details',
      description: 'Details of the target date and time',
      type: 'group',
      fields: [
        {
          id: 'targetDate',
          type: 'string',
          required: true,
          description:
            "The target date and time in ISO format (e.g., '2025-01-03T15:00:00Z').",
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    const dateDetails = parameters.find((p) => p.id === 'dateDetails');

    if (!dateDetails) {
      throw new Error("Missing 'dateDetails' in parameters.");
    }

    const targetDateStr = dateDetails.fields.find(
      (f) => f.id === 'targetDate',
    )?.value;

    if (!targetDateStr) {
      throw new Error("'targetDate' is a required field.");
    }

    const targetDate = new Date(targetDateStr);
    if (isNaN(targetDate.getTime())) {
      throw new Error("'targetDate' is not a valid ISO format.");
    }

    const now = new Date();
    const prisma = new PrismaService();

    const history = await prisma.historyWorkflow.findMany({
      where: { workflowId: workflowId },
      take: 2,
    });
    console.log(history[history.length - 1]);
    const oneMinuteAfterTarget = new Date(targetDate.getTime() + 11 * 1000);
    if (
      now >= targetDate &&
      now < oneMinuteAfterTarget &&
      history[history.length - 1].status === 'failure' &&
      history[history.length - 2].status === 'failure'
    ) {
      console.log(`Target date reached: ${targetDate.toISOString()}.`);
      return true;
    }
    return false;
  },
};

export const EventDayAndTimeReached: Event = {
  type: 'action',
  id_node: 'dayAndTimeReached',
  name: 'Day and Time Reached',
  description: 'Trigger when a specific day of the week and time are reached.',
  serviceName: 'timer',
  fieldGroups: [
    {
      id: 'scheduleDetails',
      name: 'Schedule Details',
      description: 'Details of the target day and time',
      type: 'group',
      fields: [
        {
          id: 'dayOfWeek',
          type: 'string',
          required: true,
          description:
            "The target day of the week (e.g., 'Monday', 'Tuesday').",
        },
        {
          id: 'hour',
          type: 'number',
          required: true,
          description: 'The target hour (24-hour format).',
        },
        {
          id: 'minute',
          type: 'number',
          required: true,
          description: 'The target minute.',
        },
      ],
    },
  ],
  check: async (parameters: FieldGroup[]) => {
    const workflowId = parameters
      .find((group) => group.id === 'workflow_information')
      ?.fields.find((field) => field.id === 'workflow_id')?.value;

    const scheduleDetails = parameters.find((p) => p.id === 'scheduleDetails');

    if (!scheduleDetails) {
      throw new Error("Missing 'scheduleDetails' in parameters.");
    }

    const dayOfWeek = scheduleDetails.fields.find(
      (f) => f.id === 'dayOfWeek',
    )?.value;
    const hour = scheduleDetails.fields.find((f) => f.id === 'hour')?.value;
    const minute = scheduleDetails.fields.find((f) => f.id === 'minute')?.value;

    if (!dayOfWeek || hour == null || minute == null) {
      throw new Error(
        "All fields ('dayOfWeek', 'hour', 'minute') are required.",
      );
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'Europe/Paris',
    });
    const currentHour = parseInt(
      now.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Europe/Paris',
      }),
    );
    const currentMinute = parseInt(
      now.toLocaleString('en-US', {
        minute: 'numeric',
        timeZone: 'Europe/Paris',
      }),
    );

    const prisma = new PrismaService();

    const history = await prisma.historyWorkflow.findMany({
      where: { workflowId: workflowId },
      orderBy: { executionDate: 'desc' },
      take: 6,
    });
    const allFailures =
      history.length === 6 &&
      history.every((entry) => entry.status === 'failure');

    if (
      currentDay.toLowerCase() === dayOfWeek.toLowerCase() &&
      currentHour === hour &&
      currentMinute === minute &&
      allFailures
    ) {
      return true;
    }
    return false;
  },
};

export const TimerService: Service = {
  id: 'timer',
  name: 'Timer Service',
  description: 'Service to handle events based on time',
  loginRequired: false,
  image: 'https://www.svgrepo.com/show/120927/timer.svg',
  Event: [],
  enabled: true,
};
