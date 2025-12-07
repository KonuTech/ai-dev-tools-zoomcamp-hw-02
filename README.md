# Real-time Collaborative Coding Interview Platform

A Docker-first web application for conducting collaborative coding interviews in real-time. Built with React, Node.js, Express, Socket.IO, and Monaco Editor.

## Features

- 🚀 Real-time collaborative code editing
- 👥 Multiple users can edit simultaneously
- 💻 Syntax highlighting for JavaScript and Python
- 🔒 Safe in-browser code execution (Pyodide for Python, sandboxed iframe for JavaScript)
- 🐳 Docker-based development and testing
- ⚡ Hot-reload enabled for both frontend and backend

## Tech Stack

- **Frontend**: React + Vite, Monaco Editor
- **Backend**: Node.js + Express + Socket.IO
- **Testing**: Jest + Supertest (integration), Playwright (E2E)
- **Development**: Docker Compose with hot-reload
- **Deployment**: Containerized (Railway/Render/Fly.io)

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git

### Setup

```bash
# Clone repository
git clone <your-repo-url>
cd ai-dev-tools-zoomcamp-hw-02

# Copy environment variables
cp .env.example .env

# Start the application
docker-compose up
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Using Make Commands

For convenience, a Makefile is provided with common commands:

```bash
# View all available commands
make help

# Start the application
make start          # Detached mode (runs in background)
make dev            # Attached mode (see logs in terminal)

# Stop the application
make stop

# Restart the application
make restart

# View logs
make logs           # All services
make logs-server    # Server only
make logs-client    # Client only

# Build images
make build          # Normal build
make rebuild        # Clean rebuild (no cache)

# Run tests
make test           # All tests
make test-int       # Integration tests
make test-e2e       # E2E tests

# Install dependencies
make install        # All dependencies
make install-server # Server only
make install-client # Client only

# Access container shells
make shell-server
make shell-client

# Cleanup
make clean          # Remove containers and volumes
make clean-all      # Remove everything including images
```

## Development

### Running the app

```bash
# Using Make (recommended)
make start          # Start in background
make dev            # Start and view logs

# Or using docker-compose directly
docker-compose up -d    # Start in background
docker-compose up       # Start and view logs

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Installing new dependencies

```bash
# Add server dependency
docker-compose exec server npm install <package-name>

# Add client dependency
docker-compose exec client npm install <package-name>

# Rebuild after adding dependencies
docker-compose down
docker-compose build
docker-compose up
```

### Running tests

```bash
# Run all tests (integration + E2E)
npm run test

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e
```

## Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── app/           # Main app component and styles
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── editor/        # Monaco editor setup
│   └── package.json
├── server/                # Express + Socket.IO backend
│   ├── src/
│   │   ├── index.js       # Main server file
│   │   ├── routes/        # API routes
│   │   └── realtime/      # Socket.IO handlers
│   ├── tests/             # Integration tests
│   └── package.json
├── docker/
│   └── Dockerfile.dev     # Development Dockerfile
├── e2e/                   # Playwright E2E tests
├── docker-compose.yml     # Development environment
└── package.json           # Root package.json with scripts
```

## Development Roadmap

- [x] Phase 1: Scaffold & Docker Setup
- [ ] Phase 2: Real-time Collaboration
- [ ] Phase 3: Code Editor Integration (Monaco)
- [ ] Phase 4: Code Execution (Pyodide + Sandbox)
- [ ] Phase 5: Testing (Integration + E2E)
- [ ] Phase 6: Production & CI/CD
- [ ] Phase 7: Polish & Documentation

## Scripts

### Root Level
- `npm run dev` - Start both client and server in Docker
- `npm run build` - Build Docker images
- `npm run test` - Run all tests in Docker
- `npm run down` - Stop all services
- `npm run clean` - Clean up Docker resources

### Server
- `npm run dev` - Start server with nodemon
- `npm run test:integration` - Run integration tests

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production

## Environment Variables

See `.env.example` for required environment variables.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `CLIENT_URL` - Client URL for CORS
- `VITE_SERVER_URL` - Server URL for client

## Docker Commands

```bash
# Rebuild all services
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache server

# Access container shell
docker-compose exec server sh

# View real-time logs
docker-compose logs -f server
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs server
```

### Port already in use
```bash
docker-compose down
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
```

### Clear everything and restart
```bash
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

## Contributing

See [AGENTS.md](./AGENTS.md) for git conventions and workflow guidelines.

## License

MIT
