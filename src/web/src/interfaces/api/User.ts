import { User } from "../User";

/**
 * Interface for the response from the "get current user" endpoint
 * Extends the base User interface
 */
interface getMeResponse extends User {};

/**
 * Interface for checking username availability response
 */
interface checkIfUsernameIsAvailableResponse {
  used: boolean;  // true if username is taken, false if available
}

/**
 * Interface for checking admin status response
 */
interface isAdminResponse {
  isAdmin: boolean;  // true if user is an admin, false otherwise
}

export type {
  getMeResponse,
  checkIfUsernameIsAvailableResponse,
  isAdminResponse
};
