# **Backend README**

## **Overview**

The backend of this project provides an API for creating, managing, and executing workflows. It supports integration with multiple services like YouTube, Discord, and more. For developers building a custom frontend, the backend offers a **Swagger documentation** available at:

```
http://localhost:<PORT>/doc
```

This Swagger UI allows you to explore all available endpoints and understand how to interact with the backend.

---

## **Environment Variables**

Before running the backend, you need to configure the `.env` file located in the `src/server` directory. Below is a description of each variable in the provided `.env.example` file:

### **Core Settings**

- **`HOST`**: The hostname or IP address of the server.
- **`PORT`**: The port on which the backend will run.
- **`HTTP_V`**: The HTTP protocol version (`http` or `https`).
- **`IP_REDIRECT`**: Full URL for redirection after authentication, combining `HTTP_V`, `HOST`, and `PORT`.
- **`IP_FRONT`**: The URL of the frontend server.
- **`IP_FRONT_REDIRECT`**: The full redirection URL for the frontend.

### **Database Configuration**

- **`DATABASE_URL`**: Connection string for the database. Replace placeholders with:
    - `user`: Your database username.
    - `password`: Your database password.
    - `host`: The hostname of your database server.
    - `port`: The database server's port.
    - `db`: The name of the database.

Example:
```plaintext
DATABASE_URL="mysql://admin:securepassword@localhost:3306/mydatabase"
```

### **Authentication & Security**

- **`JWT_SECRET`**: Secret key used to sign JSON Web Tokens (JWT). Ensure this is a strong, unique key.

### **Email Configuration**

- **`GMAIL_PASS`**: Password for the Gmail account used to send emails.
- **`GMAIL_USER`**: Gmail address used for sending emails.

### **OAuth Settings**

#### Google OAuth:
- **`GOOGLE_CLIENT_ID`**: Client ID from your Google Developer Console.
- **`GOOGLE_CLIENT_SECRET`**: Client secret from your Google Developer Console.

#### Discord OAuth:
- **`DISCORD_CLIENT_ID`**: Client ID from your Discord Developer Portal.
- **`DISCORD_CLIENT_SECRET`**: Client secret from your Discord Developer Portal.

---

## **Running the Backend**

### **1. Install Dependencies**

First, install all required dependencies:

```bash
cd src/server
npm install
```

### **2. Configure Environment**

Copy the `.env.example` file to `.env` and fill in the required values as described above:

```bash
cp .env.example .env
```

### **3. Start the Backend**

To start the backend, you can use Docker Compose or run it locally.

#### **Using Docker Compose**

- **Development Mode**:
  ```bash
  docker-compose -f docker-compose.dev.yml up --build
  ```

- **Production Mode**:
  ```bash
  docker-compose up --build
  ```

#### **Running Locally**

If you prefer to run the backend locally:
1. Ensure your database is running and accessible.
2. Run the application:
   ```bash
   npm run start:dev
   ```

---

## **Accessing the API**

- **Swagger Documentation**:
    - Access the API documentation at: [http://localhost:{PORT}/doc](http://localhost:<PORT>/doc).

- **Backend Endpoints**:
    - Backend runs on: [http://localhost:{PORT}](http://localhost:<PORT>).

---

## **Troubleshooting**

1. **Missing or Invalid Environment Variables**:
    - Ensure all required variables are set in the `.env` file.
    - Double-check sensitive information like database credentials and API secrets.

2. **Database Connection Issues**:
    - Verify the `DATABASE_URL` is correct and the database server is running.
    - Test the connection with a database client.

3. **Frontend Redirection Issues**:
    - Ensure `IP_FRONT` and `IP_FRONT_REDIRECT` are correctly set in `.env`.

---

Feel free to reach out for additional support or further customization!