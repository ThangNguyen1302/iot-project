# IoT Project Setup Guide

This repository contains both backend and frontend components of our IoT project.

## System Architecture

- **Backend**: Go application with MongoDB database
- **Frontend**: React Native Expo application (web build)

## Backend Setup (Root directory)

The backend consists of a Go application and a MongoDB database orchestrated using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Running the Backend

1. Navigate to the root project directory:
2. Build and start the services:

   ```bash
   docker-compose up -d
   ```

3. To view logs:

   ```bash
   docker-compose logs -f
   ```

4. To stop the services:
   ```bash
   docker-compose down
   ```

### Backend Configuration

- MongoDB is accessible at `localhost:27017`
- Backend API is accessible at `localhost:8080`
- Environment variables can be modified in the `docker-compose.yml` file

## Frontend Setup (dadn directory)

The frontend is a React Native Expo application with a Docker setup for production web builds.

### Prerequisites

- Docker

### Running the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd dadn
   ```

2. Build the Docker image:

   ```bash
   docker build -t iot-frontend:latest -f DockerFile .
   ```

3. Run the frontend container:

   ```bash
   docker run -d -p 3000:80 --name frontend-container iot-frontend
   ```

4. Access the frontend at `http://localhost:3000`

### Frontend Development

For local development without Docker:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Troubleshooting

### Backend Issues

- If MongoDB fails to connect, ensure the container is running with `docker-compose ps`
- Check MongoDB connection string in environment variables

### Frontend Issues

- If the frontend build fails, try clearing the Expo cache with `npx expo start -c`
- For Docker build issues, verify Node.js and Expo CLI versions in the Dockerfile

## Additional Information

- The backend Dockerfile uses multi-stage builds to create an optimized container
- The frontend Dockerfile creates a production-ready web build served through Nginx
- Update `update-env-ip.ts` script for automatic IP configuration in development



This is my group link report 
```bash
https://www.overleaf.com/7692353563sdvbhddhcrgn#5ec828
```

If you have any hesitation. Do not hestiate to contact me at hung.nguyenkhmt22@hcmut.edu.vn