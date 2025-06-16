# Node.js Application

A Node.js application with essential packages and configurations.

## Features

- Express.js server setup
- Security middleware (Helmet)
- CORS enabled
- Request logging (Morgan)
- Environment variables support
- MongoDB integration ready
- Development hot-reload with Nodemon
- Jest testing framework

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (if using database features)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/myapp
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

## Project Structure

```
my-dgdorm-node/
├── src/
│   └── index.js
├── .env
├── package.json
└── README.md
```
