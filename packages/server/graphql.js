/**
 * Creates and configures an Apollo GraphQL server.
 * Merges schemas and attaches to the provided Express app.
 */

import { ApolloServer } from "@apollo/server";
import { mergeSchemas } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";

/**
 * Creates an Apollo GraphQL server and attaches it to Express.
 *
 * @param {object} app - Express app instance
 * @param {object} httpServer - Node HTTP server instance
 * @param {array} schemas - List of GraphQL schemas to merge
 * @returns {Promise<void>} - Resolves when the Apollo server is started and the middleware is attached to the app
 */
export const createGraphqlServer = async (app, httpServer, schemas) => {
  const apolloServer = new ApolloServer({
    introspection: true,
    schema: mergeSchemas({
      schemas
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    bodyParser.json(),
    expressMiddleware(apolloServer)
  );
}
