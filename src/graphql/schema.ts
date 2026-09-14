import { GraphQLScalarType, Kind, ASTNode } from 'graphql';
import { createSchema } from 'graphql-yoga';
import { authTypeDefs } from './auth/schema';
import { authResolvers } from './auth/resolvers';

function parseLiteral(ast: ASTNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.OBJECT: {
      const obj: Record<string, unknown> = {};
      for (const field of ast.fields) {
        obj[field.name.value] = parseLiteral(field.value);
      }
      return obj;
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral,
});

const baseTypeDefs = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const schema = createSchema({
  typeDefs: [baseTypeDefs, authTypeDefs],
  resolvers: [
    {
      JSON: jsonScalar,
    },
    authResolvers,
  ],
});
