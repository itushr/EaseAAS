import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import { createContext } from './context';

export const server = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  fetchAPI: { Response },
  graphiql: process.env.NODE_ENV !== 'production',
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Apollo-Require-Preflight',
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  },
});
