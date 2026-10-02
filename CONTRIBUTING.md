# Contributing

## Development Workflow

1. Make a focused change in the relevant frontend or backend domain.
2. Add or update tests when behavior changes.
3. Run frontend lint/build and backend tests.
4. Keep commits small and use imperative messages, such as `Add resume upload validation`.

## Code Conventions

- Use feature/domain names that describe the product concept, not the implementation detail.
- Keep React pages responsible for composition; extract reusable controls into `components`.
- Keep API calls in frontend `services`, not directly in pages or components.
- Keep HTTP DTOs in each backend domain's `dto` package.
- Do not add credentials, generated builds, dependencies, or local database files to source control.

See [the architecture guide](docs/ARCHITECTURE.md) for the repository map and placement rules.
