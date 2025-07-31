# Project Guidelines

## Development

### Code Style

- Follow TypeScript best practices
- Use consistent naming conventions
- Always use shadcn for UI components
- Maintain proper code formatting

### Project Structure

- Keep components organized in the `src` directory
- Follow Next.js conventions for pages and routing

### Git Workflow

- Write meaningful commit messages
- Create feature branches for new development
- Review code before merging

### Backend Integration

- Create service layer for working with backend
- Use access and refresh tokens for authentication
- Use API Routes for backend communication
- Do not use any mock code

#### MCP Server Integration

The project is configured with two MCP (Model Context Protocol) servers for enhanced development capabilities:

##### Backend Filesystem Server

- **Purpose**: Access to backend codebase and business logic
- **Configuration**: `backend-filesystem` server in `.junie/mcp/mcp.json`
- **Usage**: Explore backend source code, understand business logic, review implementation details
- **Benefits**: Direct access to backend files for better understanding of API implementations

##### Swagger API Server

- **Purpose**: Access to API documentation and specifications
- **Configuration**: `swagger` server in `.junie/mcp/mcp.json`
- **Endpoint**: `https://quizifybackend-b86e8709a4d9.herokuapp.com/swagger-ui/index.html`
- **Usage**: Review API endpoints, request/response schemas, authentication requirements
- **Benefits**: Complete API documentation for accurate frontend integration

#### Development Workflow with MCP Servers

1. **API Integration**: Use swagger MCP server to understand API contracts before implementation
2. **Business Logic Review**: Use backend-filesystem MCP server to understand backend implementation
3. **Service Layer Design**: Create frontend services that align with backend architecture
4. **Type Safety**: Generate TypeScript types based on API specifications from swagger
5. **Error Handling**: Implement proper error handling based on API response patterns

## Internationalization

### Supported Locales

- **uz** - Uzbek (O'zbek tili)
- **ru** - Russian (Русский язык)
- **en** - English

### Guidelines

- All user-facing text must be translatable
- Use descriptive translation keys (e.g., `auth.login.button`)
- Test UI layouts with different text lengths
- Use Next.js internationalization features
- Use `next-intl`

## Best Practices

- Keep dependencies up to date
- Follow accessibility guidelines
- Optimize for performance
