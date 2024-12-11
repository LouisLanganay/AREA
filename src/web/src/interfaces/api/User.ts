import { User } from "../User";

interface getMeResponse extends User {};

interface checkIfUsernameIsAvailableResponse {
  used: boolean;
}

export type {
  getMeResponse,
  checkIfUsernameIsAvailableResponse
};
