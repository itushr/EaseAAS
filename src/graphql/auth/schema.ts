export const authTypeDefs = `
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
`;
