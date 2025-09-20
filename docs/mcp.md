# MCP Servers in Quizify UI

This project is configured to work with Model Context Protocol (MCP) servers for better alignment with the backend codebase and API specs.

Configured servers (.junie/mcp/mcp.json):
- backend-filesystem: mcp-server-filesystem /home/xmpl/Idea/Quizify/quizify-backend
- swagger: mcp-swagger-server https://quizifybackend-b86e8709a4d9.herokuapp.com/v3/api-docs

Notes:
- The swagger server now points to the OpenAPI JSON (/v3/api-docs) rather than the Swagger UI HTML. This is compatible with tools/codegen that consume OpenAPI documents.
- Filesystem servers give read-only access to the referenced repositories for code navigation, contracts, and consistency checks.

Recommended workflow
- Use MCP swagger server to explore endpoints and response contracts while implementing services in src/components/**/services.
- Generate TypeScript types from the OpenAPI spec when needed for stricter typing:
  npx -y openapi-typescript https://quizifybackend-b86e8709a4d9.herokuapp.com/v3/api-docs -o src/types/generated/api.d.ts
- Keep UI feature types (e.g., quiz types under src/components/features/instructor/quiz/types) aligned with backend DTOs. Normalize null values coming from the API to undefined as needed for forms/components.

Environment reminder
- NEXT_PUBLIC_API_BASE_URL is used by src/lib/api.ts and defaults to http://localhost:8080/api.
- For auth flows, NEXTAUTH_SECRET is required; set in .env.local.
- SKIP_ENV_VALIDATION=true can be used for Docker or CI builds.

Troubleshooting
- If the swagger server fails to fetch the spec, ensure the backend is reachable and the URL returns a valid OpenAPI JSON document.
- If types drift from backend changes, re-run the openapi-typescript command above and adapt services/schemas accordingly.
