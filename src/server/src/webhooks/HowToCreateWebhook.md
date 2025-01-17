# Using Webhooks in AREA

This guide explains how to integrate and use webhooks within AREA. It includes the creation of a webhook using the user service, configuring routes, and executing workflows automatically. Custom routes can also be defined for specific use cases.

---

## How Webhooks Work

Webhooks are triggered when specific events occur. In AREA, webhooks are directed to the `webhooks.controller.ts`, which automatically executes workflows associated with the webhook. By default, the route for webhooks is:

```
/webhooks/:id
```

Custom routes can be defined if needed for specific scenarios.

---

## Steps to Implement a Webhook

### 1. Define a `check` Function

Each action requires a `check` function that determines whether the action should proceed. This function must always return `false` to ensure the webhook is utilized instead.

**Example:**

```typescript
async function check(): Promise<boolean> {
    return false; // Always use the webhook mechanism
}
```

---

### 2. Create the Webhook

Use the `userService` to create the webhook. The `userService.createWebhook()` function returns `null` if the webhook for the workflow already exists. Otherwise, it provides the `id` of the newly created webhook.

**Example:**

```typescript
const userId = "example-user-id";
const workflowId = "example-workflow-id";

const webhookId = await userService.createWebhook(userId, workflowId);

if (!webhookId) {
    console.log("Webhook already exists for this workflow.");
} else {
    console.log(`Webhook created with ID: ${webhookId}`);
}
```

---

### 3. Construct the Webhook URL

Once the webhook is created, use its ID to construct the URL.

**Example:**

```typescript
const webhookUrl = `${urlAPI}/webhooks/${webhookId}`;
console.log(`Webhook URL: ${webhookUrl}`);
```

---

### 4. Handle Webhook Execution

Webhooks are automatically directed to the `webhooks.controller.ts`. This controller triggers the workflow associated with the webhook. You can also define custom routes if required.

**Default Route Example:**

```typescript
@Post('/webhooks/:id')
async handleWebhook(@Param('id') webhookId: string, @Body() payload: any): Promise<void> {
    console.log(`Received webhook for ID: ${webhookId}`);
    // Execute the workflow
    await this.workflowService.executeWorkflow(webhookId, payload);
}
```

**Custom Route Example:**

```typescript
@Post('/custom-webhook')
async handleCustomWebhook(@Body() payload: any): Promise<void> {
    console.log('Received custom webhook');
    // Custom workflow execution logic
}
```

---

## Notes

- Always use the `check` function to ensure webhook-based workflows.
- Use the `userService.createWebhook()` method to create webhooks.
- If `createWebhook()` returns `null`, the webhook already exists.
- Default routes are `/webhooks/:id`, but custom routes can be added when needed.

---

## Full Example

Below is a complete example combining all steps:

```typescript
async function setupWebhook(userId: string, workflowId: string): Promise<void> {
    // Define the check function
    async function check(): Promise<boolean> {
        return false;
    }

    // Create the webhook
    const webhookId = await userService.createWebhook(userId, workflowId);

    if (!webhookId) {
        console.log("Webhook already exists for this workflow.");
        return;
    }

    // Construct the webhook URL
    const webhookUrl = `/webhooks/${webhookId}`;
    console.log(`Webhook URL: ${webhookUrl}`);
    //setup the webhook with the external service
}

// Example webhook handler in the controller
@Post('/webhooks/:id')
async handleWebhook(@Param('id') webhookId: string, @Body() payload: any): Promise<void> {
    console.log(`Received webhook for ID: ${webhookId}`);
    await this.workflowService.executeWorkflow(webhookId, payload);
}
```



