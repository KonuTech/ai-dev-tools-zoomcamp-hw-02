
# Agentic Coding Plan — Real-time Collaborative Coding Interview Platform (Docker-First)

> Goal: build an end-to-end collaborative coding interview web app (frontend + backend) using AI agents for code generation, testing, containerization and deployment. **This improved plan focuses on Docker-based development and testing throughout the entire workflow.**

---

## File for download
This file: `agentic_coding_plan_docker.md` (improved Docker-first version)

---

## 1. Project Overview & Goals

**Core features**
- Create shareable interview links
- Real-time collaborative code editing for multiple users
- Real-time presence and cursors
- Syntax highlighting for JavaScript and Python
- Safe in-browser code execution via WASM (no server-side execution)
- **Docker-based development, testing, and deployment workflow**
- Integration tests & E2E tests running in containers
- Containerize and deploy to a cloud service

**Tech stack**
- Frontend: React + Vite, Monaco Editor for code editing
- Real-time: Socket.IO (WebSocket)
- Backend: Node.js + Express
- Testing: Playwright (E2E), Jest + Supertest (integration)
- Python WASM: Pyodide
- **Development: Docker Compose with hot-reload**
- **Testing: Docker Compose test configuration**
- Container: Multi-stage Dockerfile using `node:20-bullseye-slim` base
- Deployment: Railway (or Render / Fly)

---

## 2. Repo layout (Docker-optimized)

```
/02-coding-interview
├─ client/                      # React + Vite app
│  ├─ public/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ editor/                # Monaco setup, runtime execution helpers
│  │  └─ main.jsx
│  ├─ package.json
│  └─ vite.config.js
├─ server/                      # Express + Socket.IO
│  ├─ src/
│  │  ├─ index.js
│  │  ├─ routes/
│  │  └─ realtime/
│  ├─ package.json
│  └─ tests/                    # integration tests (Jest/Supertest)
├─ docker/
│  ├─ Dockerfile.dev            # Development multi-target Dockerfile
│  ├─ Dockerfile                # Production multi-stage build
│  └─ .dockerignore             # Exclude node_modules, .git, etc.
├─ docker-compose.yml           # Development environment
├─ docker-compose.test.yml      # Testing environment
├─ docker-compose.prod.yml      # Production (optional)
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                 # Docker-based CI pipeline
│     └─ deploy.yml             # Deployment workflow
├─ e2e/                         # Playwright E2E tests
│  ├─ tests/
│  └─ playwright.config.js
├─ .env.example                 # Environment variables template
├─ .dockerignore
├─ AGENTS.md                    # instructions/prompts for AI agents
├─ README.md
├─ package.json                 # Root package.json with test scripts
└─ agentic_coding_plan_docker.md  # this file
```

---

## 3. Agentic workflow — how to use AI agents

### Probable tasks for AI agents
- **Coding**: produce code files (frontend, backend), create/modify package.json, and export build artifacts.
- **Docker setup**: create Dockerfiles, docker-compose configurations, and .dockerignore files.
- **Testing**: write tests (integration + e2e), add test scripts, and run tests in Docker containers.
- **DevOps**: produce Docker configurations, CI workflow, and deployment instructions.
- **Reviewing**: inspect diffs, propose fixes, and generate changelog/commit messages.
- **Git**: run git commands, create branches, open PRs, and tag releases (instructions provided in `AGENTS.md`).

### Initial prompt for AI agents

```
Create a real-time collaborative coding interview platform with the following requirements:

TECHNICAL STACK:
- Frontend: React + Vite with Monaco Editor
- Backend: Node.js + Express + Socket.IO
- Testing: Jest + Supertest (integration), Playwright (E2E)
- In-browser execution: Pyodide for Python, sandboxed iframe for JavaScript
- Development: Docker Compose with hot-reload
- Deployment: Containerized on Railway

CORE FEATURES:
1. Shareable interview room links
2. Real-time collaborative code editing (Socket.IO)
3. Live cursors and presence indicators
4. Syntax highlighting for JavaScript and Python
5. Safe client-side code execution (WASM/sandboxed)

DOCKER REQUIREMENTS:
- All development must happen in Docker containers
- Hot-reload enabled for both frontend and backend
- All tests must run in Docker containers
- Multi-stage production Dockerfile
- Docker Compose for dev, test, and prod environments

PROJECT STRUCTURE:
- Monorepo with /client and /server folders
- Docker configurations in /docker folder
- E2E tests in /e2e folder
- Root package.json with Docker-based test commands

DELIVERABLES:
1. Working app running via `docker-compose up`
2. All tests passing via `npm run test` (Docker-based)
3. Production Dockerfile ready for deployment
4. CI/CD pipeline using Docker
5. README with Docker setup instructions
```

---

## 4. Development & run commands (Docker-based)

### Initial setup

```bash
# Clone repository
git clone <repo-url>
cd 02-coding-interview

# Copy environment variables
cp .env.example .env

# Build development images
docker-compose build

# Start the application
docker-compose up
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Development workflow

```bash
# Start both services (attached mode, see logs)
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Installing new dependencies

```bash
# Add server dependency
docker-compose exec server npm install <package-name>

# Add client dependency
docker-compose exec client npm install <package-name>

# After adding dependencies, rebuild
docker-compose down
docker-compose build
docker-compose up
```

### Accessing containers

```bash
# Open shell in server container
docker-compose exec server sh

# Open shell in client container
docker-compose exec client sh

# Run commands inside container
docker-compose exec server npm run lint
docker-compose exec client npm run build
```

### Rebuild after Dockerfile changes

```bash
# Rebuild all services
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache server

# Rebuild and restart
docker-compose up --build
```

### Alternative: Local development (without Docker)

If you prefer faster iteration without Docker:

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Terminal 1: Run server
cd server && npm run dev

# Terminal 2: Run client
cd client && npm run dev
```

**Note:** For homework submission, use Docker-based workflow.

---

## 5. Integration & E2E tests (Docker-based)

### Running tests in Docker

```bash
# Run all tests (integration + E2E)
npm run test

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests with custom options
docker-compose -f docker-compose.test.yml run --rm test-integration --verbose
docker-compose -f docker-compose.test.yml run --rm test-e2e --headed
```

### Root package.json scripts

Add these scripts to the root `package.json`:

```json
{
  "name": "coding-interview-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "docker-compose up",
    "dev:detached": "docker-compose up -d",
    "down": "docker-compose down",
    "build": "docker-compose build",
    "test": "docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test-e2e",
    "test:integration": "docker-compose -f docker-compose.test.yml run --rm test-integration",
    "test:e2e": "docker-compose -f docker-compose.test.yml run --rm test-e2e",
    "test:local": "npm run test:integration --prefix server && npx playwright test",
    "logs": "docker-compose logs -f",
    "clean": "docker-compose down -v && docker system prune -f"
  }
}
```

### Test structure

**Integration tests** (`server/tests/`)
- Test REST API endpoints
- Test WebSocket connection and room management
- Test message broadcasting
- Use Jest + Supertest

**E2E tests** (`e2e/tests/`)
- Test complete user flows
- Test real-time collaboration between multiple users
- Test code execution in browser
- Use Playwright

### Recommended test command for homework

**Terminal command:** `npm run test`

This runs both integration and E2E tests in Docker containers, ensuring consistency with CI/CD pipeline.

---

## 6. Syntax highlighting — which library to use?

Use **Monaco Editor** (the editor powering VS Code).

**Why Monaco?**
- Built-in syntax highlighting for JavaScript and Python
- IntelliSense and autocomplete
- Rich language features (go to definition, find references)
- Easy integration with React
- Excellent TypeScript support

**Alternative:** CodeMirror 6 (lighter weight) or Prism.js (syntax only).

**(Answer to homework Question 4)**: **Monaco Editor**

---

## 7. Browser-side code execution — which library for Python→WASM?

Use **Pyodide** to run Python in the browser via WebAssembly.

**Features:**
- Full Python interpreter in browser
- Supports scientific packages (NumPy, Pandas, etc.)
- API: `pyodide.runPython(code)`
- No server-side execution needed

**Security considerations:**
- Pyodide runs in browser sandbox (cannot access server filesystem)
- Implement execution timeouts using Web Workers
- Use iframe sandboxing for additional isolation
- Set Content Security Policy (CSP) headers

**(Answer to homework Question 5)**: **Pyodide**

---

## 8. Docker configuration files

### 8.1. Development Dockerfile (`docker/Dockerfile.dev`)

```dockerfile
# Base image with common dependencies
FROM node:20-bullseye-slim AS base
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Server development stage
FROM base AS server-dev
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Client development stage
FROM base AS client-dev
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Integration test stage
FROM base AS test-integration
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
ENV NODE_ENV=test
CMD ["npm", "run", "test:integration"]

# E2E test stage
FROM base AS test-e2e
WORKDIR /app
# Install Playwright and browsers
RUN npx playwright install --with-deps chromium
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=test
CMD ["npx", "playwright", "test"]
```

### 8.2. docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: server-dev
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app/server
      - /app/server/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3000
      - CLIENT_URL=http://localhost:5173
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  client:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: client-dev
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app/client
      - /app/client/node_modules
    environment:
      - NODE_ENV=development
      - VITE_SERVER_URL=http://localhost:3000
    networks:
      - app-network
    depends_on:
      server:
        condition: service_healthy

networks:
  app-network:
    driver: bridge
```

### 8.3. docker-compose.test.yml (Testing)

```yaml
version: '3.8'

services:
  test-integration:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: test-integration
    volumes:
      - ./server:/app/server
      - /app/server/node_modules
    environment:
      - NODE_ENV=test
    networks:
      - test-network

  server-for-e2e:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: server-dev
    volumes:
      - ./server:/app/server
      - /app/server/node_modules
    environment:
      - NODE_ENV=test
      - PORT=3000
    networks:
      - test-network

  client-for-e2e:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: client-dev
    volumes:
      - ./client:/app/client
      - /app/client/node_modules
    environment:
      - NODE_ENV=test
      - VITE_SERVER_URL=http://server-for-e2e:3000
    networks:
      - test-network
    depends_on:
      - server-for-e2e

  test-e2e:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
      target: test-e2e
    volumes:
      - ./e2e:/app/e2e
      - ./client:/app/client
      - ./server:/app/server
    environment:
      - NODE_ENV=test
      - BASE_URL=http://client-for-e2e:5173
    networks:
      - test-network
    depends_on:
      - client-for-e2e
      - server-for-e2e

networks:
  test-network:
    driver: bridge
```

### 8.4. Production Dockerfile (`docker/Dockerfile`)

```dockerfile
# Stage 1 - build client
FROM node:20-bullseye-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2 - build server
FROM node:20-bullseye-slim AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .

# Stage 3 - final production image
FROM node:20-bullseye-slim
WORKDIR /app

# Copy server files
COPY --from=server-build /app/server /app/server

# Copy built client files to server's public directory
COPY --from=client-build /app/client/dist /app/server/public

# Install production dependencies only
WORKDIR /app/server
RUN npm ci --production

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/index.js"]
```

### 8.5. .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
dist
build
coverage
.vscode
.idea
*.log
.DS_Store
README.md
docker-compose*.yml
Dockerfile*
.dockerignore
.github
e2e/test-results
e2e/playwright-report
```

**(Answer to homework Question 6)**: **node:20-bullseye-slim**

---

## 9. Docker Development Best Practices

### Volume Mounting Strategy
- **Source code**: Mount for hot-reload (`./client:/app/client`)
- **node_modules**: Use anonymous volumes to avoid conflicts (`/app/client/node_modules`)
- **Databases**: Use named volumes for persistence (`postgres_data:/var/lib/postgresql/data`)

### Performance Optimization
- Use `.dockerignore` to exclude `node_modules/`, `.git/`, `dist/`, `.env`
- Enable BuildKit: `export DOCKER_BUILDKIT=1`
- Use multi-stage builds to minimize final image size
- Layer caching: Copy `package*.json` before source code

### Debugging in Docker

```bash
# Attach to running container
docker-compose exec server sh

# View real-time logs
docker-compose logs -f server

# Debug with Node inspector
# Add to docker-compose.yml:
# ports:
#   - "9229:9229"
# command: node --inspect=0.0.0.0:9229 src/index.js
```

### Environment Variables
- Use `.env` file for local development (add to .gitignore)
- Use `.env.example` as template
- Pass via docker-compose.yml `environment:` section

Example `.env`:
```
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@db:5432/mydb
JWT_SECRET=your-secret-key
```

### Adding Database (PostgreSQL example)

Add to `docker-compose.yml`:
```yaml
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-coding_interview}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

volumes:
  postgres_data:
```

---

## 10. Deployment recommendation

**Recommended:** **Railway**

**Why Railway?**
- Easy Docker deployment
- Automatic HTTPS
- Built-in PostgreSQL/Redis provisioning
- GitHub integration for CI/CD
- Simple environment variable management
- Fair free tier

**Alternatives:**
- **Render** — similar features, Docker support
- **Fly.io** — global regions, Docker-native
- **Vercel** — excellent for frontend, serverless backend (Socket.IO requires extra setup)

### Deployment commands

```bash
# Build production image
docker build -f docker/Dockerfile -t coding-interview-app .

# Test production image locally
docker run --rm -p 3000:3000 coding-interview-app

# Deploy to Railway (using Railway CLI)
railway up

# Or push to Docker registry
docker tag coding-interview-app <registry>/coding-interview-app:latest
docker push <registry>/coding-interview-app:latest
```

**(Answer to homework Question 7)**: **Railway**

---

## 11. CI/CD Pipeline (GitHub Actions with Docker)

### .github/workflows/ci.yml

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-buildx-

      - name: Build development images
        run: docker-compose -f docker-compose.test.yml build

      - name: Run integration tests
        run: docker-compose -f docker-compose.test.yml run --rm test-integration

      - name: Run E2E tests
        run: docker-compose -f docker-compose.test.yml run --rm test-e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            e2e/test-results/
            e2e/playwright-report/

      - name: Build production image
        run: docker build -f docker/Dockerfile -t coding-interview-app .

      - name: Test production build
        run: |
          docker run -d -p 3000:3000 --name test-app coding-interview-app
          sleep 10
          curl -f http://localhost:3000/health || exit 1
          docker stop test-app

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push production image
        run: |
          docker build -f docker/Dockerfile -t ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:latest .
          docker tag ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:latest \
                     ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:${{ github.sha }}
          docker push ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:${{ github.sha }}

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service coding-interview-app
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 12. AGENTS.md — Git & Docker agent instructions

Create `AGENTS.md` to instruct AI agents:

```markdown
# AGENTS.md — Git, Docker & Agent Conventions

## Branching Strategy
- Main branch: `main`
- Feature branches: `feat/<short-description>`
- Hotfix branches: `fix/<short-description>`
- Test branches: `test/<what-is-being-tested>`

## Docker Development Workflow

### Starting development
```bash
git checkout -b feat/my-feature
docker-compose up --build
```

### Making changes
1. Edit code (hot-reload handles updates)
2. Run tests: `npm run test`
3. Check logs: `docker-compose logs -f`

### Before committing
```bash
# Run all tests
npm run test

# Check git status
git status

# View changes
git diff

# If tests pass, commit
git add -A
git commit -m "feat: implement feature X"
```

## Git Commands for AI Agents

### Create feature branch
```bash
git checkout -b feat/realtime-collab
```

### Stage and commit
```bash
git add -A
git status
git diff --staged
git commit -m "feat: add Socket.IO real-time collaboration"
```

### Push and create PR
```bash
git push origin feat/realtime-collab
gh pr create --title "feat: Real-time collaboration" \
             --body "Implements Socket.IO for real-time code editing"
```

## Commit Message Convention
- `feat:` new feature
- `fix:` bug fix
- `test:` add or update tests
- `docs:` documentation changes
- `chore:` maintenance tasks
- `refactor:` code refactoring
- `docker:` Docker configuration changes

## AI Agent Testing Protocol

Before any commit, agents must:
1. Run `npm run test` (Docker-based tests)
2. Ensure all tests pass
3. Show `git status` and `git diff`
4. Use descriptive commit messages
5. Include test results in PR description

## Docker Commands for AI Agents

### Rebuild after dependency changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Debug failed tests
```bash
docker-compose -f docker-compose.test.yml run --rm test-e2e --debug
```

### Clean up
```bash
docker-compose down -v
docker system prune -f
```
```

---

## 13. Security Checklist

### Client-side Execution
- ✅ Use Pyodide for Python (runs in browser WASM sandbox)
- ✅ Use sandboxed iframe for JavaScript execution
- ✅ Set strict Content Security Policy (CSP) headers
- ✅ Implement execution timeouts via Web Workers
- ✅ Disable network access in execution environment

### Server-side
- ✅ Rate-limit room creation and WebSocket messages
- ✅ Validate all Socket.IO messages
- ✅ Use CORS configuration for allowed origins
- ✅ Don't persist or log user code without consent
- ✅ Implement room expiration (TTL)

### Docker Security
- ✅ Run containers as non-root user
- ✅ Use minimal base images (`-slim` variants)
- ✅ Don't include secrets in images (use environment variables)
- ✅ Scan images for vulnerabilities: `docker scan coding-interview-app`
- ✅ Use `.dockerignore` to exclude sensitive files

### Example CSP Header
```javascript
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net/pyodide/; " +
    "worker-src 'self' blob:; " +
    "connect-src 'self' ws://localhost:3000 wss://your-domain.com"
  );
  next();
});
```

---

## 14. Suggested Milestones & Timeline

### Phase 1: Scaffold & Docker Setup
1. Initialize repository structure
2. Create Docker configurations (Dockerfile.dev, docker-compose.yml)
3. Set up client (React + Vite) and server (Express) skeletons
4. Verify `docker-compose up` works

### Phase 2: Real-time Collaboration
1. Implement Socket.IO server with rooms
2. Add WebSocket client connection
3. Broadcast code changes between users
4. Add presence indicators and cursors

### Phase 3: Code Editor Integration
1. Integrate Monaco Editor
2. Wire editor events to Socket.IO
3. Add syntax highlighting for JS and Python
4. Implement cursor position sharing

### Phase 4: Code Execution
1. Integrate Pyodide for Python execution
2. Create sandboxed iframe for JavaScript execution
3. Add execution UI (run button, output console)
4. Implement execution timeouts

### Phase 5: Testing
1. Write integration tests (Jest + Supertest)
2. Write E2E tests (Playwright)
3. Configure docker-compose.test.yml
4. Add test scripts to package.json

### Phase 6: Production & CI/CD
1. Create production Dockerfile
2. Set up GitHub Actions CI pipeline
3. Configure deployment to Railway
4. Add health checks and monitoring

### Phase 7: Polish & Documentation
1. Error handling and loading states
2. UX improvements
3. README documentation
4. Demo video/screenshots

---

## 15. Example Code Snippets

### Socket.IO Server (server/src/index.js)

```javascript
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store room states in memory (use Redis for production)
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userId, username }) => {
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: "",
        language: "javascript",
        users: new Map()
      });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, { userId, username });

    // Send current room state to new user
    socket.emit("room-state", {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values())
    });

    // Notify others
    socket.to(roomId).emit("user-joined", { userId, username });
  });

  socket.on("code-change", ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      socket.to(roomId).emit("code-update", { code });
    }
  });

  socket.on("cursor-position", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor-update", {
      userId: socket.id,
      position
    });
  });

  socket.on("disconnect", () => {
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        io.to(roomId).emit("user-left", { userId: user.userId });
      }
    });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Pyodide Integration (client/src/editor/pyodide-runner.js)

```javascript
let pyodide = null;

export async function initPyodide() {
  if (pyodide) return pyodide;

  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });

    // Redirect stdout to capture output
    await pyodide.runPythonAsync(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
    `);

    return pyodide;
  } catch (error) {
    console.error("Failed to load Pyodide:", error);
    throw error;
  }
}

export async function runPythonCode(code, timeout = 5000) {
  const pyodide = await initPyodide();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Execution timeout"));
    }, timeout);

    try {
      // Clear previous output
      pyodide.runPython("sys.stdout = StringIO()");

      // Run user code
      pyodide.runPython(code);

      // Get output
      const output = pyodide.runPython("sys.stdout.getvalue()");

      clearTimeout(timer);
      resolve(output);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}
```

### Monaco Editor Integration (client/src/components/CodeEditor.jsx)

```javascript
import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

export default function CodeEditor({ value, onChange, language, onCursorChange }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Monaco Editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: value || "",
      language: language || "javascript",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      tabSize: 2
    });

    // Listen for content changes
    editorRef.current.onDidChangeModelContent(() => {
      const newValue = editorRef.current.getValue();
      onChange?.(newValue);
    });

    // Listen for cursor position changes
    editorRef.current.onDidChangeCursorPosition((e) => {
      onCursorChange?.({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  // Update language
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);

  // Update value from external source (other users)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(value);
      editorRef.current.setPosition(position);
    }
  }, [value]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
```

---

## 16. Example Answers to Homework Questions

- **Question 1 (Initial prompt)**: See Section 3 "Initial prompt for AI agents"
- **Question 2 (Tests command)**: `npm run test` (runs integration and E2E tests via docker-compose.test.yml)
- **Question 3 (Dev command)**: `docker-compose up` (starts both client and server with hot-reload)
- **Question 4 (Syntax highlighting library)**: `Monaco Editor`
- **Question 5 (Python→WASM library)**: `Pyodide`
- **Question 6 (Docker base image)**: `node:20-bullseye-slim`
- **Question 7 (Deployment service)**: `Railway`

---

## 17. Deliverables Checklist

### Code
- [ ] `/client` — React + Vite frontend with Monaco Editor
- [ ] `/server` — Express + Socket.IO backend
- [ ] `/e2e` — Playwright end-to-end tests
- [ ] `server/tests/` — Jest integration tests

### Docker Configuration
- [ ] `docker/Dockerfile.dev` — Development multi-target build
- [ ] `docker/Dockerfile` — Production multi-stage build
- [ ] `docker-compose.yml` — Development environment
- [ ] `docker-compose.test.yml` — Testing environment
- [ ] `.dockerignore` — Exclude unnecessary files

### Documentation
- [ ] `README.md` — Setup, run, and test instructions
- [ ] `AGENTS.md` — Git and Docker conventions for AI agents
- [ ] `.env.example` — Environment variables template

### CI/CD
- [ ] `.github/workflows/ci.yml` — Docker-based CI pipeline
- [ ] Health check endpoints
- [ ] Deployment configuration

### Scripts (package.json)
- [ ] `npm run dev` → `docker-compose up`
- [ ] `npm run test` → Run all tests in Docker
- [ ] `npm run test:integration` → Integration tests
- [ ] `npm run test:e2e` → E2E tests

---

## 18. Quick Start Guide

```bash
# 1. Clone and setup
git clone <your-repo>
cd 02-coding-interview
cp .env.example .env

# 2. Start development environment
docker-compose up

# 3. Run tests
npm run test

# 4. Build production image
docker build -f docker/Dockerfile -t coding-interview-app .

# 5. Test production build
docker run -p 3000:3000 coding-interview-app
```

Visit: http://localhost:5173

---

## 19. Troubleshooting

### Docker issues

```bash
# Container won't start
docker-compose logs server

# Port already in use
docker-compose down
lsof -ti:3000 | xargs kill -9

# Clear everything and restart
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
docker-compose up

# Volume permission issues (Linux)
sudo chown -R $USER:$USER .
```

### Hot reload not working

```bash
# Ensure volumes are mounted correctly
docker-compose config

# Check if nodemon/vite is watching files
docker-compose exec server npm run dev -- --verbose
```

### Tests failing

```bash
# Run tests with verbose output
docker-compose -f docker-compose.test.yml run --rm test-integration --verbose

# Check test containers logs
docker-compose -f docker-compose.test.yml logs

# Run tests locally (bypass Docker)
npm run test:local
```

---

## 20. Additional Resources

### Docker
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### Testing
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)

### Real-time
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Pyodide Documentation](https://pyodide.org/en/stable/)

### Deployment
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

_End of Docker-first plan._
