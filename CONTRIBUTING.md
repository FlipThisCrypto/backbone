# Contributing to Backbone

Thank you for your interest in contributing to Backbone! This document provides guidelines for contributing to the project.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/FlipThisCrypto/backbone.git
   cd backbone
   ```

2. Install dependencies:
   ```bash
   # UI dependencies
   cd ui && npm install

   # Core Python dependencies  
   cd ../core && pip install -r requirements.txt

   # API dependencies
   cd ../api && npm install
   ```

3. Set up development environment:
   ```bash
   # Copy example configs
   cp config/templates/project_config_example.json config/project_config.json
   cp config/templates/points_map_example.json config/points_map.json
   ```

## Architecture Overview

Backbone follows a 4-layer architecture:

1. **Smart Contracts** (`/contracts`) - Chialisp on-chain verification
2. **Core Engine** (`/core`) - Python off-chain computation  
3. **API Layer** (`/api`) - Node.js REST endpoints and orchestration
4. **User Interface** (`/ui`) - React configuration wizard

## Security Guidelines

### Critical Security Patterns

1. **Nullifier Pattern**: Use deterministic coin creation to prevent double claims without state bloat
2. **Admin Authorization**: Require signatures for critical operations like epoch commits
3. **Atomic Operations**: Prevent concurrency races with atomic state updates

### Code Review Checklist

- [ ] No unbounded state growth in contracts
- [ ] Administrative operations properly authorized
- [ ] Input validation on all user data
- [ ] Proper error handling and logging
- [ ] Tests cover security edge cases

## Testing Requirements

All contributions must include tests:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Layer interaction testing  
- **Security Tests**: Attack scenario validation
- **End-to-End Tests**: Full workflow testing

Run tests with:
```bash
# Python tests
cd core && python -m pytest

# JavaScript tests  
cd ui && npm test
cd api && npm test

# Chialisp tests
cd contracts && ./run_tests.sh
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request with:
   - Clear description of changes
   - Test coverage report
   - Security consideration notes

## Coding Standards

### Python (Core Engine)
- Follow PEP 8 style guidelines
- Use type hints for all public functions
- Include docstrings for classes and public methods
- Use dataclasses for structured data

### TypeScript/React (UI)
- Use TypeScript for all new code
- Follow React hooks patterns
- Use consistent component structure
- Include prop types and interfaces

### Chialisp (Contracts)  
- Include comments explaining complex logic
- Use consistent naming conventions
- Add validation for all inputs
- Follow security best practices

## Documentation

- Update README.md for user-facing changes
- Add/update API documentation for endpoint changes
- Include architecture docs for design changes
- Add security notes for security-related changes

## Issue Reporting

When reporting issues:

1. Use the appropriate issue template
2. Include reproduction steps
3. Provide system information
4. Include relevant logs/errors
5. Label with appropriate severity

## Security Disclosure

For security vulnerabilities:

1. **DO NOT** open a public issue
2. Email security@flipthiscrypto.com
3. Include full details and reproduction steps
4. Allow 90 days for fix before public disclosure

## Code of Conduct

- Be respectful and inclusive
- Focus on technical merit
- Help newcomers learn
- Give constructive feedback
- Follow community guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
