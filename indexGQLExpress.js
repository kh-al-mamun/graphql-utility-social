import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { verifyJWT } from './verificationFunctions/verifyJWT.js';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './dotenv.config.js';
const port = env.PORT || 4000;

//import route files
import jwtRouter from './routes/jwt.js';

//import schema and resolver
import typeDefs from './graphql/schema/schema.js';
import resolvers from './graphql/resolvers/resolvers.js';

//create an express app and pass it to the httpServer
const app = express();
const httpServer = http.createServer(app);

//use general middle wires
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://utility-social.web.app'], // Replace with your client's origin
    credentials: true // Allow sending cookies and other credentials
  }),
  cookieParser(),
  express.json(),
);

//use router files as middle wire
app.use('/jwt', jwtRouter);

app.get('/', (req, res) => {
  // console.log("req.cookies: ", req.cookies);
  res.send({isAwake: true, status: 'awake', message: `Server is awake on port ${port}`});
})

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use('/graphql', expressMiddleware(server, {
  context: async({req}) => {
    const userContext = verifyJWT(req.cookies, req.headers);
    return {...userContext}
  }
}));

await new Promise((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:${env.PORT || 4000}`);