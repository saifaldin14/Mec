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
  // Create an instance of ApolloServer with the provided schemas and enable introspection
  const apolloServer = new ApolloServer({
    introspection: true,
    schema: mergeSchemas({
      schemas
    }),
    // Add a plugin to drain the HTTP server on stop
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  // Attach the Apollo server middleware to the '/graphql' route of the Express app
  app.use(
    "/graphql",
    // Parse JSON bodies in the request
    bodyParser.json(),
    // Convert the Apollo server middleware to an Express middleware
    expressMiddleware(apolloServer)
  );
}
