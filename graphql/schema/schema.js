import songsSchema from './songsSchema.js';
import todosSchema from './todosSchema.js';
import usersSchema from './usersSchema.js';
import postsSchema from './postsSchema.js';
import reportSchema from './reportSchema.js';

// The GraphQL schema
const rootSchema = `#graphql

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  scalar Date
  scalar Int64
`;

export default [rootSchema, usersSchema, todosSchema, songsSchema, postsSchema, reportSchema];