# Security Policy

## Supported Roles
- `editor`: Authorized for content creation and metadata updates.
- `admin`: Authorized for catalog publication and infrastructure changes.

## Reporting Vulnerabilities
Please report security vulnerabilities via private security advisories or directly to project maintainers.

## Authentication Simulation
In development environments, user roles are passed via the `X-User-Role` HTTP header.

## Security Best Practices for Production
- Always set strong database passwords via `.env` or container secret injection.
- Ensure `uploads/` directory has non-executable filesystem permissions (`chmod 644`).
