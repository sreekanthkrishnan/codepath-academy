# Local development

Prerequisites: Java 25, Maven 3.9+, Docker Desktop, and Node 22+.

1. Copy `.env.example` to a local `.env` and use development-only passwords.
2. Start PostgreSQL: `./scripts/compose.sh up postgres`.
3. Start API: `cd apps/api && mvn spring-boot:run`.
4. Start the existing frontend: `npm install && npm run dev`.
5. Visit `http://localhost:5173`, API health at `http://localhost:8080/actuator/health`, and OpenAPI UI at `http://localhost:8080/swagger-ui.html`.

`./scripts/compose.sh up --build` starts all three services when Docker is available. The helper prefers Docker Compose v2 (`docker compose`) and falls back to legacy Compose v1 (`docker-compose`), which is installed on this machine. Never use the example credentials in production.
