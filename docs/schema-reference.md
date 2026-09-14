# Schema Reference

This document describes the GraphQL type system and underlying database models.

---

## 1. GraphQL Type Definitions

```graphql
scalar JSON

type Tenant {
  id: ID!
  domain: String!
  settings: JSON
  createdAt: String!
  updatedAt: String!
}

type User {
  id: ID!
  tenantId: String!
  tenant: Tenant
  username: String
  email: String
  domain: String!
  emailVerified: Boolean!
  data: JSON
  lastLoginAt: String
  createdAt: String!
  updatedAt: String!
}

type AuthPayload {
  user: User!
  token: String!
}

type Query {
  me: User
  check: User
}

type Mutation {
  register(email: String!, password: String!, username: String): AuthPayload!
  login(identifier: String!, password: String!): AuthPayload!
  logout: Boolean!
  setUsername(username: String!): User!
}
```

---

## 2. Database Models & Prisma Schema

### `tenants` Table

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique identifier (UUID) |
| `domain` | `TEXT` | `NOT NULL, UNIQUE` | Unique tenant domain (indexed) |
| `settings` | `JSONB` | `NOT NULL, DEFAULT '{}'` | Tenant configuration parameters |
| `created_at` | `TIMESTAMP(3)` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP(3)` | `NOT NULL` | Automatic update timestamp |

**Indexes:**
- `tenants_pkey` (`id`)
- `tenants_domain_key` (`domain`, UNIQUE)
- `tenants_domain_idx` (`domain`)

---

### `users` Table

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique identifier (UUID) |
| `tenant_id` | `TEXT` | `NOT NULL, FK -> tenants.id` | Foreign key referencing tenant (ON DELETE CASCADE) |
| `username` | `TEXT` | `UNIQUE, NULLABLE` | Optional unique username handle |
| `email` | `TEXT` | `UNIQUE, NULLABLE` | Optional unique email address |
| `password_hash`| `TEXT` | `NOT NULL` | Salted bcrypt password hash |
| `domain` | `TEXT` | `NOT NULL` | Tenant domain recorded at registration |
| `email_verified`| `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Verification flag |
| `data` | `JSONB` | `NOT NULL, DEFAULT '{}'` | User metadata storage |
| `last_login_at` | `TIMESTAMP(3)` | `NULLABLE` | Timestamp of most recent authentication |
| `created_at` | `TIMESTAMP(3)` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP(3)` | `NOT NULL` | Automatic update timestamp |

**Indexes:**
- `users_pkey` (`id`)
- `users_username_key` (`username`, UNIQUE)
- `users_email_key` (`email`, UNIQUE)
- `users_tenant_id_idx` (`tenant_id`)
- `users_domain_idx` (`domain`)

---

## 3. Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL (e.g., Supabase connection) |
| `JWT_SECRET` | Yes | - | Secret key used for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Expiration window for issued JWT tokens |
| `COOKIE_NAME` | No | `token` | Cookie key name for storing session tokens |
| `NODE_ENV` | No | `development` | Runtime environment (`development` or `production`) |
