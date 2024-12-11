# How to Create a Service

## Introduction

This document describes how to create a service in the server. A service is a class that provides a set of functionalities to the client. The client can call these functionalities by sending a request to the server. When the server receives the request, it will call the corresponding function in the service to process the request. The service will then return the result to the client.

## Steps

1. Create a new file in the `src/service` directory. The file should be named after the service, e.g., `MyService.ts`.
2. Import Required Modules

Import the necessary modules and services at the top of your file.

```typescript
import { Service, Event, FieldGroup } from '../../../shared/Workflow';
```

3. Define the Event

Define the event that the service will handle. In this example, we will create an event to retrieve a message from a Discord channel, for an event reaction you don't have to define check but execute.

```typescript
export const EventgetMessageDiscord: Event = {
    type: "action",
    id_node: "getMessageDiscord",
    name: "Get Message",
    description: "Retrieve a message from a Discord channel",
    serviceName: "discord",
    fieldGroups: [
        {
            id: "channelDetails",
            name: "Channel Details",
            description: "Information about the Discord channel",
            type: "group",
            fields: [
                { id: "channelId", type: "string", required: true, description: "The channel ID" }
            ]
        },
        {
            id: "messageDetails",
            name: "Message Details",
            description: "Information about the message to retrieve",
            type: "group",
            fields: [
                { id: "message", type: "string", required: true, description: "The message content" }
            ]
        }
    ],
    check: () => {
        console.log("Executing 'Get Message' action for Discord");
        return true;
    }
};
```

5. Export the Service
   Finally, export the service with the defined events.

```typescript
   export const discordService: Service = {
    id: "discord",
    name: "Discord",
    description: "Messaging service for teams",
    loginRequired: true,
    image: "https://www.svgrepo.com/show/353655/discord-icon.svg",
    Event: [],
    auth: {
        uri: "/auth/discord",
        callback_uri: "/auth/discord/callback"
    }
};
```

6. Add to list of service in main.ts

## Conclusion

By following these steps, you can add a new service to the server. This example demonstrates how to create a Discord service that retrieves a message from a Discord channel. Adjust the event and service definitions as needed for your specific use case.
