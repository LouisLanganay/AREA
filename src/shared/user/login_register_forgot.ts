interface login_request {
    id: string; // email or username
    password: string;
}

interface login_response {
    access_token: string;
}

interface register_request {
    email: string;
    username: string;
    password: string;
    displayName?: string;
    avatarUrl?: string;
}

interface register_response {
    access_token: string;
}

interface forgot {
    email: string;
}

export type {
    login_request,
    login_response,
    register_request,
    register_response,
    forgot
};
