interface loginRequest {
  id: string; // email or username
  password: string;
}

interface registerRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  avatarUrl?: string;
}

interface forgotRequest {
  email: string;
}

interface resetRequest {
  password: string;
  token: string;
}

interface loginResponse {
  access_token: string;
}

interface registerResponse {
  access_token: string;
}

export type {
  loginRequest,
  loginResponse,
  registerRequest,
  registerResponse,
  forgotRequest,
  resetRequest
};
