import { User } from "../User";

interface getMeResponse extends User {};

interface checkIfUsernameIsAvailableResponse {
  used: boolean;
}

interface isAdminResponse {
  isAdmin: boolean;
}

export type {
  getMeResponse,
  checkIfUsernameIsAvailableResponse,
  isAdminResponse
};
