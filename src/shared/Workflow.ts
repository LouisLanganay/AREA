interface Field {
    id: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'date' | 'checkbox' | 'color';
    label: string;                    // ex: "Server"
    value?: any;                      // ex: "167628734852438"
    required: boolean;                // ex: true
    options?: any[];
}

interface FieldGroup {
    id: string;
    name: string;                     // ex: "Server"
    description: string;              // ex: "The server where the action will be executed"
    type: string;                     // ex: "server"
    fields: Field[];
}

interface Service {
    id: string;
    name: string;                    // ex: "Slack"
    description: string;             // ex: "Send a message to a channel"
    enabled: boolean;                // ex: true
    image?: string;                  // ex: "https://slack.com/img/logos/slack-logo-horizontal.png"
    actions?: {
        id: string;
        name: string;
        description: string;
    }[];
    reactions?: {
        id: string;
        name: string;
        description: string;
    }[];
    auth?: {
        uri: string;                  // ex: "api/auth/discord"
        callback_uri: string;         // ex: "api/auth/discord/callback"
    };
}

interface Condition {
    id: string;
    lastChecked?: number;            // timestamp
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    variable: string;                // The variable to check (e.g., "branch")
    value: any;                      // The value to compare against (e.g., "main")
    type?: 'string' | 'number' | 'boolean';  // Optional type for value validation
}

interface Variable {
    id: string;
    name: string;                    // ex: "%author_name%"
    description: string;             // ex: "The name of the author of the message"
    type: 'string' | 'number';       // ex: "string"
    value: any;
}

interface Node {
    id: string;
    type: 'action' | 'reaction';
    name: string;                   // ex: "Send a message"
    description: string;            // ex: "Send a message to a channel"
    service: {
        id: string;
        name: string;
        description: string;
    };
    last_trigger?: number;           // timestamp
    fieldGroups: FieldGroup[];
    nodes: Node[];
    conditions?: Condition[];
    variables?: Variable[];
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    image: string;
    nodes: Node[];
    enabled?: boolean;
}

export type {
    Field,
    FieldGroup,
    Service,
    Condition,
    Node,
    Workflow,
    Variable
}
