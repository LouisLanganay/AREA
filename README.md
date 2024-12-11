# area
# **Project README**

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

Before running the project, you must configure the required environment variables. There are `.env.example` files provided to guide you in setting up the `.env` files. Here’s what you need to do:

1. **Root `.env`**:
   - Located at the root of the project.
   - Use this to configure global environment settings.
   - Example:
     ```bash
        MYSQL_ROOT_PASSWORD="root_pswd"
        MYSQL_DATABASE="linkit"
        MYSQL_USER="user"
        MYSQL_PASSWORD="user_pswd"
     ```

2. **Backend `.env`**:
   - Located in `src/server`.
   - Use this to configure backend-specific settings like database connection and API keys.
   - Example:
     ```bash
     DATABASE_URL=postgres://user:password@localhost:5432/database_name
     JWT_SECRET=your_jwt_secret
     ...
     ```

3. **Frontend `.env`**:
   - Located in `src/web`.
   - Use this to configure frontend-specific settings like API endpoints.
   - Example:
     ```bash
     VITE_API_URL=http://localhost:8080
     ```

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

---

## **Create a New Service**

To create a new service in the project, you got a doc at [Create a Service](src/server/src/service/HowToCreateAService.md).

## **Additional Notes**

- Ensure Docker and Docker Compose are installed on your machine before running the commands.
- If you encounter any issues, verify that your `.env` files are properly configured.
- The project is modular, making it easy to extend by adding new services, actions, or reactions.

---

Feel free to reach out if you have any questions or need assistance setting up the project!