# Apollo server Express GraphQL API example

> Provides a working API to expand from for initial development

## Upstream

Created from [node-express-apollo-graphql](https://github.com/lancegliser/node-express-apollo-graphql).

## Local packages

Installed `winston-redact` from 
```
git clone -b trentm/winston-redact https://github.com/elastic/ecs-logging-nodejs.git
```


## GraphQL Playground

Once server is running (`npm run-script dev:watch`)
You may load and interact with data through the
[playground](http://localhost:5000/api/graphql).

## Code generation and work flow

This API works from a GraphQL first approach.
Each component you wish to write starts with a `.graphql` file.
The types in it will cause typescript code to be generated
by running the following command:

```
npm run graphql-codegen
```

The generated classes are created at:

```
src/generated/types.ts
```

You can import those types in your own resolver,
providing you strong contracts and stub implementations.

## Testing

Integration tests are run using [Jest](https://jestjs.io/) to create an
instance of the API on a random port using Node. Testing supplies
its own user context.

Jest can use a local `.env` file for process environment variables.
