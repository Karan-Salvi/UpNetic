# UpNetic – A Professional Community Platform

**UpNetic** is a full-stack professional community platform like LinkedIn where users can connect, post updates, chat in real time, and grow their network. It supports infinite scrolling feeds and live messaging via WebSockets.

---

## Features

### Authentication & Security

- User registration & login (JWT-based)
- Password hashing via bcrypt
- Secure route protection with middleware

### Posts & Feed

- Create, update, and delete posts
- Like and comment system
- Infinite scrolling for optimized feed loading
- Tag support for post discoverability

### Connections

- Send & accept connection requests
- View all connections
- Mutual connections logic

### Real-Time Messaging

- WebSocket (Socket.IO)-based direct messaging
- Real-time updates when users send/receive messages
- Persistent chat history with MongoDB
- Online/offline user status support

### Full-Stack Tech

- RESTful APIs built with Express.js
- MongoDB with Mongoose for data modeling
- Real-time communication with Socket.IO
- React + Redux Toolkit + RTK Query frontend
- Fully responsive UI with Tailwind CSS

---

## Tech Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | React (Vite), Redux Toolkit, Tailwind CSS |
| Backend   | Node.js, Express.js, Socket.IO            |
| Database  | MongoDB + Mongoose                        |
| Auth      | JWT + bcrypt                              |
| Realtime  | Socket.IO                                 |
| Dev Tools | ESLint, Nodemon, Postman                  |

---

## Project Structure

```
UpNetic/
├── Backend/
│   ├── middleware/
│   ├── models/             # User, Post, Connection, Chat
│   ├── routes/             # auth.js, posts.js, connections.js, chats.js
│   ├── sockets/            # Socket.IO handlers
│   ├── server.js
|   ├── .env
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── App.jsx
│   ├── vite.config.js
|   ├── .env

```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Karan-Salvi/UpNetic.git
cd UpNetic
```

### 2. Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

Update `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/upnetic
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
npm run dev
```

---

## Infinite Scrolling (Frontend)

Implemented using:

- RTK Query paginated endpoint
- Intersection Observer API

Backend endpoint sample:

```http
GET /api/posts?page=2&limit=10
```

---

## Real-Time Messaging (Socket.IO)

- Socket connection established at login
- Messages sent/received instantly via Socket.IO
- Unread message indicators
- MongoDB stores all messages

````

---

## API Endpoints (Sample)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `POST /api/users/profile/:userId`
- `POST /api/profile/:userId`
- `GET /api/users/upload-avatar`
- `GET /api/users/serch`


### Posts

- `GET /api/posts?page=1`
- `POST /api/posts`
- `DELETE /api/posts/:id`
- `GET /api/posts/:id`
- `POST /api/posts/:postId/like`
- `POST /api/posts//:postId/comments`

### Connections

- `GET /api/connections/`
- `POST /api/connections/request`
- `GET /api/connections/:requestId`
- `DELETE /api/connections/:connectionId`

### Chat

- `GET /api/chats`
- `GET /api/chats/:chatId`
- `GET /api/chats/:chatId/messages?page=1&limit=50`
- `POST /api/chats`
- `POST /api/chats/:chatId/messages`
- `PUT /api/chats/:chatId/messages/:messageId`
- `DELETE /api/chats/:chatId/messages/:messageId`

---

## Scripts

**Backend:**

```bash
npm run dev       # Dev server with nodemon
npm start         # Production server
````

**Frontend:**

```bash
npm run dev       # Dev mode
npm run build     # Build production
npm run preview   # Preview production
```

---

## Security Features

- JWT token-based authentication
- Passwords hashed using bcrypt
- Helmet for HTTP headers
- CORS and Rate Limiting
- Input validation with Validator.js

---
