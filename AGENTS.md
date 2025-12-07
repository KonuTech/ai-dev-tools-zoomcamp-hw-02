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
