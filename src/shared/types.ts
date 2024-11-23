interface Client {
    host: string;
}

interface Server {
    current_time: number;
    services: {
        name: string;
        description: string;
        actions: {
            name: string;
            description: string;
        }[];
        reactions: {
            name: string;
            description: string;
        }[];
    }[];
}

interface About {
    client: Client;
    server: Server;
}

export type { Client, Server, About };
