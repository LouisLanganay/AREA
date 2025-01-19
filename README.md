# AREA - LinkIt

![LinkIt Illustration](assets/linkit%20illustration%20banner.png)

## **Project Concept**

This project is a flexible and dynamic automation platform inspired by services like IFTTT. It enables users to create workflows by combining triggers (actions) and reactions, leveraging APIs from third-party services like YouTube, Discord, and others, as well as built-in functionalities like time-based triggers. The system is designed to allow users to seamlessly manage and execute workflows.

---

## **How to Clone the Project**

To get started, you need to clone the repository to your local machine. Run the following command in your terminal:

```bash
git clone https://github.com/LouisLanganay/AREA
cd AREA
```

---

## **Setup and Configuration**

### **Environment Variables**

Before running the project, you must configure the required environment variables. There are `.env.example` files provided to guide you in setting up the `.env` files. Here's what you need to do:

1. **Root `.env`**:
   - Located at the root of the project.
   - Use this to configure global environment settings.

2. **Backend `.env`**:
   - Located in `src/server`.
   - Use this to configure backend-specific settings like database connection and API keys.

3. **Frontend `.env`**:
   - Located in `src/web`.
   - Use this to configure frontend-specific settings like API endpoints.

Make sure to copy each `.env.example` to a `.env` file in the same location and fill in the required values.

---

## **Running the Project**

This project uses Docker to simplify the setup and ensure consistent development and production environments.

### **Start with Docker Compose**

1. **Development Environment**:
   - Use the `docker-compose.dev.yml` file to run the project in development mode.
   - Command:
     ```bash
     docker-compose -f docker-compose.dev.yml up --build
     ```

2. **Production Environment**:
   - Use the default `docker-compose.yml` file to run the project in production mode.
   - Command:
     ```bash
     docker-compose up --build
     ```

3. **Stop the Services**:
   - To stop all running containers:
     ```bash
     docker-compose down
     ```

---

## **Project Structure**

- **Frontend**:
  - Accessible on `http://localhost:8081`.
  - Implements the user interface for creating and managing workflows.
- **Backend**:
  - Accessible on `http://localhost:8080`.
  - Handles API requests and workflow execution logic.
- **Environment**:
  - `.env.example` files are present in the root, `src/server`, and `src/web` directories for configuration guidance.
  - `.env.example` file is in the root of the project.
  -

---

## **Create a New Service**

To create a new service in the project, you got a doc at [Create a Service](src/server/README.md).

## **Additional Documentation**

- [Web README](src/web/README.md)
- [Server README](src/server/README.md)

## **Additional Notes**

- Ensure Docker and Docker Compose are installed on your machine before running the commands.
- If you encounter any issues, verify that your `.env` files are properly configured.
- The project is modular, making it easy to extend by adding new services, actions, or reactions.

---

## **API Documentation**

Below is a comprehensive table describing the available API routes, their authentication requirements, request types, and a brief description of each.

| Route                          | Auth Needed | Type   | Description                                      |
|--------------------------------|-------------|--------|--------------------------------------------------|
| `/about.json`                  | No          | GET    | Get about.json with data for service.            |
| `/services`                    | Yes         | GET    | Get all services.                                |
| `/auth/register`               | No          | POST   | Register a new user.                             |
| `/auth/login`                  | No          | POST   | Login a user.                                    |
| `/auth/forgot-password`        | No          | POST   | Request a password reset.                        |
| `/auth/google/redirect/{service}` | No       | GET    | Redirect for Google OAuth.                       |
| `/auth/google/callback/{service}` | No       | POST   | Callback for Google OAuth.                       |
| `/auth/discord/redirect`       | No          | GET    | Redirect for Discord OAuth.                      |
| `/auth/discord/callback`       | No          | POST   | Discord OAuth callback.                          |
| `/auth/reset-password`         | No          | POST   | Reset user password.                             |
| `/auth/google`                 | No          | POST   | Google OAuth, route for receiving code from Google. |
| `/auth/discord`                | No          | POST   | Discord OAuth.                                   |
| `/auth/createAdmin`            | No          | GET    | Create a default admin user for testing.         |
| `/auth/spotify/redirect`       | No          | GET    | Redirect for Spotify OAuth.                      |
| `/auth/spotify/callback`       | No          | POST   | Callback for Spotify OAuth.                      |
| `/users/me`                    | Yes         | GET    | Get the current user's information.              |
| `/users/update/{id}`           | Yes         | PATCH  | Update the current user's information.           |
| `/users`                       | Yes         | DELETE | Delete a connected user.                         |
| `/users`                       | Yes         | GET    | Get all users (for admin).                       |
| `/users/use/{username}`        | No          | GET    | Check if a username is already in use.           |
| `/users/{id}`                  | Yes         | DELETE | Delete a user by ID (for admin).                 |
| `/users/{id}`                  | Yes         | GET    | Get user by ID (for admin).                      |
| `/users/isAdmin`               | Yes         | GET    | Check if the user is an admin.                   |
| `/users/setRole/{id}/{role}`   | Yes         | GET    | Set role for user (for admin).                   |
| `/users/setStatus/{id}/{status}` | Yes       | GET    | Set status for user (for admin).                 |
| `/users/{id}/workflows-history` | Yes        | GET    | Get the history of all workflows for a user (for admin). |
| `/workflows`                   | Yes         | POST   | Create a new workflow.                           |
| `/workflows`                   | Yes         | GET    | Get all workflows for a user.                    |
| `/workflows/{id}`              | Yes         | GET    | Get a workflow by ID.                            |
| `/workflows/{id}`              | Yes         | PATCH  | Update an existing workflow.                     |
| `/workflows/{id}`              | Yes         | DELETE | Delete an existing workflow.                     |
| `/workflows/run/{id}`          | Yes         | GET    | Run a workflow by ID.                            |
| `/workflows/{id}/history`      | Yes         | GET    | Get the history of a workflow by ID.             |
| `/webhooks/{id}`               | No          | POST   | Handle webhook.                                  |
| `/discord-app/authorize`       | No          | GET    | Authorize Discord app.                           |
| `/discord-app/callback`        | No          | GET    | Callback for Discord app authorization.          |
| `/ai/generate-workflow`        | No          | POST   | Generate a workflow using OpenAI.                |
| `/ai/update-workflow`          | No          | POST   | Update an existing workflow using OpenAI.        |
| `/workflows-history`           | Yes         | GET    | Get the history of all workflows for a user.     |
| `/workflows-history/all`       | Yes         | GET    | Get the history of all workflows.                |

> [!NOTE]
> The API is documented with Swagger. You can access the Swagger UI at `http://localhost:8080/doc` for more detailed information.
