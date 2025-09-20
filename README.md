# 🚀 Collaborative Project Management Tool

> A modern project management tool built with NestJS and TypeScript for efficient team collaboration.

---

## 📝 Description

A **Collaborative Project Management Tool** built with **NestJS** and **TypeScript**. It enables teams to manage projects and tasks efficiently with **real-time updates**, **role-based access control**, and **priority-based task management**. The backend is modular, scalable, and containerized with **Docker**, using **PostgreSQL/MongoDB**, **Redis**, and **Elasticsearch** for performance and search.

---

## ✨ Features

- 👤 **User & Role Management:** Sign up, login, and RBAC
- 📁 **Project & Task Management:** Create projects, assign tasks, set priorities and dependencies
- ⚡ **Real-Time Updates:** Notifications via WebSocket or message queues
- 📊 **Analytics & Reporting:** Track task completion and generate PDF/CSV reports
- 🚀 **Performance & Scalability:** database sharding, and API rate limiting

---

## 🛠 Tech Stack

- **Backend:** Node.js, Nest.js
- **ORM/ODM:** Prisma
- **Database:** postgres
- **Authentication** JWT (jsonwebtoken), bcrypt, passport.js
- **Middleware:** CORS, cookie-parser
- **Testing:** Jest
- **Development Tools:** TypeScript, ts-node-dev, ESLint, Prettier
- **Containerization:** Docker, Docker Compose

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/abdullahal5/project-plus-server.git
cd project-plus-server

# Using npm
npm install

# Using yarn
yarn install

# Start in development mode
npm run start:dev
# or
yarn start:dev

# Build and start in production mode
npm run build
npm run start:prod
# or
yarn build
yarn start:prod

```

### 🐳 Docker Deployment (optional)

> Reminder: Make sure you have a .env file with the required environment variables.

```bash

# Build the Docker image
docker build -t projectplus-server-app .

# Run the Docker container
docker run -d -p 5000:5000 --name nest-app-container --env-file .env projectplus-server-app

# Or using Docker Compose
docker-compose up --build

```

---

## 🧪 Testing

```bash
# Run unit and integration tests with Jest
npm run test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Run tests and generate coverage report
npm run test:cov
# or
yarn test:cov

```

---

## 🔑 Environment Variables

Create a `.env` file in the root of the project and add the following variables (use your own secure values instead of these demo placeholders):

```env
PORT=5000
DATABASE_URL=YOUR_DATABASE_URL
BCRYPT_ROUND_NUM=8
JWT_SECRET=super_secret
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=ELASTIC_PASSWORD
ELASTICSEARCH_NODE=Node
```

---

## 📚 API Endpoints

### Auth

- `POST /auth/login` – Login user
- `POST /auth/refresh-token` – Refresh access token

### Users

- `POST /users/register` – Create a new user
- `GET /users` – Get all users
- `GET /users/:id` – Get single user
- `PATCH /users/:id` – Update a user
- `PATCH /users/:id/toggle-active` – Toggle user status (Admin only)
- `DELETE /users/:id` – Delete a user (Admin only)

### Projects

- `POST /projects` – Create project
- `POST /graphql` – Get all projects (GraphQL)
- `GET /projects/:id` – Get single project
- `PATCH /projects/:id` – Update project
- `DELETE /projects/:id` – Delete project

### Tasks

- `POST /tasks` – Create task
- `POST /graphql` – Get all tasks (GraphQL)
- `POST /graphql` – Get my tasks (GraphQL)
- `GET /tasks/:id` – Get single task
- `PATCH /tasks/status/:id` – Update task status
- `PATCH /tasks/:id` – Update task
- `DELETE /tasks/:id` – Delete task

### Notifications

- `POST /notifications` – Create notification
- `GET /notifications` – Get all my notifications
- `PATCH /notifications/:id/read` – Read a notification
- `PATCH /notifications/read-all` – Mark all notifications as read

### Reports & Analytics

- `POST /graphql` – Get analytics and reports (GraphQL)
