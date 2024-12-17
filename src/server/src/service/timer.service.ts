import {Service, Event, FieldGroup} from '../../../shared/Workflow';

export const TimerService: Service = {
    id: "timer",
    name: "Timer Service",
    description: "Service to handle events based on time",
    loginRequired: false,
    image: "https://www.svgrepo.com/show/532140/timer.svg",
    Event: [],
}