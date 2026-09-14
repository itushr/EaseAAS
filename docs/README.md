# Backend API Documentation

This directory documents all GraphQL APIs implemented for the Backend-as-a-Service (BaaS) platform.

## Table of Contents
- [Overview](#overview)
- [Base URL & Endpoint](#base-url--endpoint)
- [Multi-Tenancy Architecture](#multi-tenancy-architecture)
- [Authentication & Sessions](#authentication--sessions)
- [CORS Configuration](#cors-configuration)
- [API Reference](./auth-api.md)
- [Schema Reference](./schema-reference.md)

---

## Overview

The platform provides a unified GraphQL API endpoint serving multi-tenant backend services. Phase 1 implements the multi-tenant Authentication Service.

### Key Capabilities
- Multi-tenant isolation powered by domain resolution.
- Email/password registration with optional username assignment.
- Identifier-based login (accepts email or username).
- Dual authentication methods: HTTP-only secure cookies and `Authorization: Bearer <token>` headers.
- Auto-login upon registration.
- Profile and username management.
- Complete CORS support for cross-origin client applications.

---

## Base URL & Endpoint

| Protocol | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| HTTP/HTTPS | `POST` | `/graphql` | Standard GraphQL query and mutation requests |
| HTTP/HTTPS | `GET` | `/graphql` | GraphiQL IDE (development) or GraphQL query execution |
| HTTP/HTTPS | `OPTIONS` | `/graphql` | CORS preflight requests |

### Default Development URL
```
http://localhost:3000/graphql
```

---

## Multi-Tenancy Architecture

Tenants are resolved automatically on each request using domain discovery:

1. The server inspects incoming request headers in the following priority:
   - `x-forwarded-host` (first host in proxy list)
   - `host`
   - Request URL hostname
2. The domain is stripped of port numbers and lowercased (e.g., `api.example.com`).
3. During user registration, if the tenant record for that domain does not exist, it is provisioned automatically with default settings (`{}`).
4. All registered users are tied directly to their respective `tenant_id` and `domain`.

---

## Authentication & Sessions

### 1. Dual Authentication Flow
Clients can authenticate requests using either of two methods:

- **Cookie Authentication**:
  - Upon calling `register` or `login`, the server automatically attaches a `Set-Cookie` header with the JWT token named `token`.
  - Cookie attributes: `HttpOnly`, `Path=/`, `Max-Age=604800` (7 days), `SameSite=Lax` (development) / `SameSite=None` (production with HTTPS), `Secure` (production).
  - Browsers automatically send this cookie with credentials on subsequent requests.

- **Bearer Token Authentication**:
  - The `token` string returned in the `AuthPayload` object can also be sent manually in the HTTP header:
    ```http
    Authorization: Bearer <JWT_TOKEN>
    ```

### 2. Session Invalidation
Calling the `logout` mutation clears the authentication cookie from the client.

---

## CORS Configuration

The GraphQL endpoint supports permissive cross-origin resource sharing (CORS) across all origins:
- `Access-Control-Allow-Origin: *` (or mirrored request origin when credentials are sent)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Apollo-Require-Preflight`
