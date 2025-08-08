# Contributing to @iamsuperdev/typeful

Thank you for your interest in contributing to typeful! We welcome contributions from the community to help make this type-safe database query library even better.

## Getting Started

### Prerequisites

- Bun runtime (latest version recommended)
- PostgreSQL database (for testing and development)
- TypeScript 5.8.2 or higher

### Setting Up Development Environment

1. Fork the repository and clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/typeful.git
cd typeful
```

2. Install dependencies:

```bash
bun install
```

3. Set up your environment variables:
   Create a `.env` file in the root directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

4. Build the project to verify your setup:

```bash
bun run build
```

## Development Workflow

### Project Structure

```
src/              # Source TypeScript files
  - generate.ts   # Type generation logic
  - db.ts         # Database connection utilities
  - build.ts      # Build utilities
  - types.ts      # Type definitions
  - utils.ts      # Utility functions
  - index.ts      # Main entry point
  - run-generate.ts # CLI for type generation
dist/             # Built JavaScript files (generated)
```

### Available Scripts

- `bun run build` - Build TypeScript and minify output
- `bun run uglify` - Minify JavaScript files in dist/
- `bun run lint` - Run ESLint on the codebase
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun x generate` - Generate types from database schema (via bin command)

### Making Changes

1. Create a new branch for your feature or fix:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes in the `src/` directory

3. Test your changes:
   - Ensure type generation works correctly with `bun x generate`
   - Run linting with `bun run lint`
   - Check formatting with `bun run format:check`

4. Build and lint the project:

```bash
bun run build
bun run lint
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Avoid using `any` types
- Provide proper type annotations for function parameters and return values
- Follow existing code patterns and conventions

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for types and interfaces
- Use SCREAMING_SNAKE_CASE for constants
- Use descriptive names that clearly indicate purpose

### Code Organization

- Keep files focused on a single responsibility
- Extract reusable logic into utility functions
- Maintain clear separation between type generation and runtime code

## Testing

### Running Tests

```bash
# Currently no test suite is configured
# Tests can be added in the future
```

### Writing Tests

- Add tests for new features and bug fixes
- Ensure tests cover both success and error cases
- Test type generation with various database schemas
- Verify generated types are correct and complete

## Submitting Changes

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if you've changed APIs or added features
3. Add or update tests as appropriate
4. Ensure all tests pass and the build succeeds
5. Update the README.md if needed

### Pull Request Template

When creating a PR, please include:

- **Description**: Clear explanation of what changes were made and why
- **Type of Change**: Bug fix, new feature, breaking change, etc.
- **Testing**: How you tested your changes
- **Screenshots**: If applicable for UI changes
- **Related Issues**: Link any related issues

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:

```
feat(generator): add support for composite foreign keys

Added logic to handle composite foreign keys in type generation.
This allows for more complex database relationships to be properly typed.

Closes #123
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. Description of the bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Your environment (OS, Node version, PostgreSQL version)
6. Database schema example (if relevant)
7. Error messages or stack traces

### Feature Requests

For feature requests, please describe:

1. The problem you're trying to solve
2. Your proposed solution
3. Alternative solutions you've considered
4. Additional context or examples

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences
- Show empathy towards other community members

### Getting Help

- Check existing issues and documentation first
- Ask questions in issue discussions
- Provide context and be specific when asking for help
- Share your learnings to help others

## Release Process

Releases are managed by maintainers. The process includes:

1. Update version in `package.json`
2. Update changelog
3. Run full test suite
4. Build and verify distribution files
5. Publish to npm using `bun publish` or `npm publish`
6. Create GitHub release with notes

## License

By contributing to typeful, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, feel free to open an issue for discussion or reach out to the maintainers.

Thank you for contributing to typeful! 🚀
