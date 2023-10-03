import dateResolver from '../customScalars/dateScalar.js';
import songsResolver from './songsResolver.js';
import todosResolver from './todosResolver.js';
import usersResolver from './usersResolver.js';
import postQueryResolvers from './postsQueryResolver.js';
import postMutationResolvers from './PostsMutationResolver.js';
import int64Resolver from '../customScalars/int64Scalar.js';
import reportResolver from './reportResolver.js';

export default [dateResolver, int64Resolver, usersResolver, todosResolver, songsResolver, postQueryResolvers, postMutationResolvers, reportResolver];