# Meč - JavaScript full-stack framework

> `Meč` is a simple JavaScript full-stack framework based on Lit Web Components

## Getting Started

### Install the framework

```
npm i -g mec-framework
```

### Create a new project

In a project directory, execute the following:

```
mec init
```

After the project is initialized, run `mec dev` to start the new app or `mec create` to scaffold!

## Features

### Server

- File-based and dynamic URL handling
- GraphQL API server support
- Ability to start multiple servers within the same context
- Event API integrated with API routes.

## Docs

- [Initialization](#initialization)
- [Server Configuration](#server-configuration)
- [Middleware](#middleware)
- [Routing](#routing)
- [Client Views](#client-views)

## Initialization

To begin, you'll need to initialize a new Mec application.

```javascript
const app = await Mec.initialize();
```

## Server Configuration

`app.createServer(options)`

```javascript
const server = await app.createServer({
  name: "package-service",
  routesRootDir: "routes",
  port: 9000,
  gql: true, // Indicates GraphQL is enabled
});
```

Options:

- `name`: Name of the server.
- `routesRootDir`: The directory containing route definitions.
- `port`: The port on which the server will listen.
- `gql`: A boolean value to indicate if GraphQL is enabled.

## Middleware

`server.addMiddleware(name, callback)`

Parameters:

- `name`: A unique name for the middleware.
- `callback`: A function to be executed as middleware.

## Routing

`const router = server.createRouter(path);`

Parameters:

- `path`: The URL path for the route.
- `callback`: A function handling the request-response for this route.

`router.addMiddleware(name, callback)`

## Client Views

Client Views create front-end application endpoints to server HTML, CSS, and JavaScript.

`server.addClientView(path, viewName, config)`

Parameters:

- `path`: The URL path where the view will be accessible.
- `viewName`: The name of the view, used to locate the view template or component.
- `config`: A configuration object with view-specific options.

## Static Directories

Adds a new static path to serve static files from a particular directory.

`server.addStaticDirectory(path, directory);`

## License

[MIT](LICENSE)
