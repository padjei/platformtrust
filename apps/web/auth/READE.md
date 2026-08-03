# PlatformTrust Authentication and Authorization Package

This package provides shared identity, authentication, authorization, and
tenant-context capabilities.

## Responsibilities

- Authentication primitives.
- Session and token validation.
- Tenant-context resolution.
- Role-based access control.
- Attribute-based access control.
- Permission definitions.
- Policy evaluation interfaces.
- Service identity support.
- Authorization test utilities.

## Security Principles

- Deny by default.
- Apply least privilege.
- Authenticate every protected request.
- Authorize every protected action.
- Never rely on hidden UI elements as access control.
- Never accept client-supplied roles or permissions as authoritative.
- Include tenant context in authorization decisions.
- Record security-relevant authorization events.

## Package Boundary

This package may define shared authorization mechanisms.

Individual domains remain responsible for defining the permissions and
policies associated with their own resources.

## Planned Contents

```text
src/
├── authentication/
├── authorization/
├── permissions/
├── policies/
├── tenant-context/
├── service-identity/
└── testing/
