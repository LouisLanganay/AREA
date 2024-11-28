interface login {
    id: string; // email or username
    password: string;
}

interface register {
    email: string;
    username: string;
    password: string;
    displayName?: string;
    avatarUrl?: string;
}

interface forgot {
    email: string;
}

