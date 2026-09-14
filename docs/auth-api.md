# Auth Service API Reference

All requests must be sent as `POST` requests to `/graphql` with `Content-Type: application/json`.

---

## Operations Summary

| Operation | Type | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| [`register`](#1-register-mutation) | Mutation | No | Registers a new user, provisions tenant if needed, sets auth cookie |
| [`login`](#2-login-mutation) | Mutation | No | Authenticates user via email or username, sets auth cookie |
| [`me`](#3-me-query) | Query | Optional | Returns the currently authenticated user and tenant profile |
| [`check`](#4-check-query) | Query | Optional | Session verification query (alias of `me`) |
| [`setUsername`](#5-setusername-mutation) | Mutation | Yes | Updates or claims the handle for the current logged-in user |
| [`logout`](#6-logout-mutation) | Mutation | No | Invalidate session by deleting the auth cookie |

---

## 1. Register Mutation

Creates a new user account. If the tenant for the current request host does not exist, it is created automatically. A JWT session cookie is automatically returned.

### GraphQL Definition
```graphql
mutation Register($email: String!, $password: String!, $username: String) {
  register(email: $email, password: $password, username: $username) {
    token
    user {
      id
      email
      username
      domain
      emailVerified
      data
      tenantId
      tenant {
        id
        domain
      }
      createdAt
      updatedAt
    }
  }
}
```

### Input Arguments

| Field | Type | Required | Validation Rules |
| :--- | :--- | :--- | :--- |
| `email` | `String!` | Yes | Valid email format, lowercase normalized, unique per system |
| `password` | `String!` | Yes | Minimum 6 characters |
| `username` | `String` | No | 3-30 characters, alphanumeric, underscores and hyphens only (`^[a-zA-Z0-9_-]+$`) |

### Example Request (Without Username)
```json
{
  "query": "mutation Register($email: String!, $password: String!) { register(email: $email, password: $password) { token user { id email username domain createdAt } } }",
  "variables": {
    "email": "developer@example.com",
    "password": "SecurePassword123!"
  }
}
```

### Example Request (With Username)
```json
{
  "query": "mutation Register($username: String!, $email: String!, $password: String!) { register(username: $username, email: $email, password: $password) { token user { id email username domain createdAt } } }",
  "variables": {
    "username": "dev_alex",
    "email": "alex@example.com",
    "password": "SecurePassword123!"
  }
}
```

### Success Response (`200 OK`)
```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "761c4701-d7ec-44f2-a05e-f51b689a9f07",
        "email": "dev_alex@example.com",
        "username": "dev_alex",
        "domain": "localhost",
        "createdAt": "2026-09-14T10:50:00.000Z"
      }
    }
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Register($email: String!, $password: String!) { register(email: $email, password: $password) { token user { id email username } } }",
    "variables": {
      "email": "test@example.com",
      "password": "password123"
    }
  }'
```

---

## 2. Login Mutation

Authenticates a user via either their registered email or username identifier. Returns a signed JWT and sets the authentication cookie.

### GraphQL Definition
```graphql
mutation Login($identifier: String!, $password: String!) {
  login(identifier: $identifier, password: $password) {
    token
    user {
      id
      email
      username
      domain
      lastLoginAt
      tenant {
        id
        domain
      }
    }
  }
}
```

### Input Arguments

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `identifier` | `String!` | Yes | Email address or username |
| `password` | `String!` | Yes | User account password |

### Example Request
```json
{
  "query": "mutation Login($identifier: String!, $password: String!) { login(identifier: $identifier, password: $password) { token user { id email username lastLoginAt } } }",
  "variables": {
    "identifier": "dev_alex",
    "password": "SecurePassword123!"
  }
}
```

### Success Response (`200 OK`)
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "761c4701-d7ec-44f2-a05e-f51b689a9f07",
        "email": "dev_alex@example.com",
        "username": "dev_alex",
        "lastLoginAt": "2026-09-14T11:05:00.000Z"
      }
    }
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($identifier: String!, $password: String!) { login(identifier: $identifier, password: $password) { token user { id email username } } }",
    "variables": {
      "identifier": "dev_alex",
      "password": "SecurePassword123!"
    }
  }'
```

---

## 3. Me Query

Retrieves the current authenticated user's record and linked tenant. If not logged in, returns `null` without an error.

### GraphQL Definition
```graphql
query Me {
  me {
    id
    email
    username
    domain
    emailVerified
    data
    lastLoginAt
    tenantId
    tenant {
      id
      domain
      settings
      createdAt
    }
    createdAt
    updatedAt
  }
}
```

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
# or Cookie: token=<JWT_TOKEN>
```

### Success Response (Authenticated)
```json
{
  "data": {
    "me": {
      "id": "761c4701-d7ec-44f2-a05e-f51b689a9f07",
      "email": "dev_alex@example.com",
      "username": "dev_alex",
      "domain": "localhost",
      "emailVerified": true,
      "data": {},
      "lastLoginAt": "2026-09-14T11:05:00.000Z",
      "tenantId": "e1f1bb59-8669-42b7-a379-cb2929e5e4aa",
      "tenant": {
        "id": "e1f1bb59-8669-42b7-a379-cb2929e5e4aa",
        "domain": "localhost",
        "settings": {},
        "createdAt": "2026-09-14T10:45:00.000Z"
      },
      "createdAt": "2026-09-14T10:50:00.000Z",
      "updatedAt": "2026-09-14T11:05:00.000Z"
    }
  }
}
```

### Success Response (Unauthenticated)
```json
{
  "data": {
    "me": null
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{ "query": "query Me { me { id email username tenant { domain } } }" }'
```

---

## 4. Check Query

Provides an alias to `me` for session status validation and health checks.

### GraphQL Definition
```graphql
query Check {
  check {
    id
    email
    username
    domain
  }
}
```

### Success Response
```json
{
  "data": {
    "check": {
      "id": "761c4701-d7ec-44f2-a05e-f51b689a9f07",
      "email": "dev_alex@example.com",
      "username": "dev_alex",
      "domain": "localhost"
    }
  }
}
```

---

## 5. SetUsername Mutation

Sets or updates the unique username handle for the currently logged-in user. Requires an authenticated session.

### GraphQL Definition
```graphql
mutation SetUsername($username: String!) {
  setUsername(username: $username) {
    id
    username
    email
    updatedAt
  }
}
```

### Input Arguments

| Field | Type | Required | Validation Rules |
| :--- | :--- | :--- | :--- |
| `username` | `String!` | Yes | 3-30 characters, alphanumeric, underscores and hyphens only |

### Example Request
```json
{
  "query": "mutation SetUsername($username: String!) { setUsername(username: $username) { id username email updatedAt } }",
  "variables": {
    "username": "octocat_prime"
  }
}
```

### Success Response (`200 OK`)
```json
{
  "data": {
    "setUsername": {
      "id": "761c4701-d7ec-44f2-a05e-f51b689a9f07",
      "username": "octocat_prime",
      "email": "dev_alex@example.com",
      "updatedAt": "2026-09-14T11:15:00.000Z"
    }
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "mutation SetUsername($username: String!) { setUsername(username: $username) { id username } }",
    "variables": {
      "username": "octocat_prime"
    }
  }'
```

---

## 6. Logout Mutation

Logs out the current session and clears the HTTP-only authentication cookie from the client.

### GraphQL Definition
```graphql
mutation Logout {
  logout
}
```

### Success Response (`200 OK`)
```json
{
  "data": {
    "logout": true
  }
}
```

### Response Headers
```http
Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

### cURL Example
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{ "query": "mutation Logout { logout }" }'
```

---

## Error Handling

Errors follow the standard GraphQL response specification:

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["login"]
    }
  ],
  "data": null
}
```

### Common Error Messages

| Error Message | Cause | Resolution |
| :--- | :--- | :--- |
| `Email is already registered` | `register` called with an existing email | Use a different email or log in |
| `Username is already taken` | `register` or `setUsername` requested handle that belongs to another user | Choose an available username |
| `Invalid credentials` | `login` failed identifier lookup or password comparison | Verify email/username and password |
| `Unauthorized` | Protected mutation (`setUsername`) invoked without authentication | Include `Authorization: Bearer <token>` or active cookie |
| Zod validation error | Malformed email, password under 6 characters, or invalid username regex | Correct input format according to schema |
