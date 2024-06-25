# lendsqr-wallet

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.)
&nbsp;
[![Version: v0.0.0](https://img.shields.io/badge/Lendsqr_Wallet-v0.0.0-blue?style=flat&logo=money)](CHANGELOG.md)
&nbsp;
[![codecov](https://codecov.io/gh/django102/lendsqr-wallet/graph/badge.svg?token=FsVdxFIsVR)](https://codecov.io/gh/django102/lendsqr-wallet)
&nbsp;


&nbsp;

### Lendsqr Demo Wallet

&nbsp;

## License
This respository is available as open source under the terms of the [Apache 2.0 License](https://opensource.org/licenses/Apache-2.0).


&nbsp;

## Environment Variables Required to bootstrap this project

| Key                        | Environment Variable   | Default                                                                                           |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| **NODE_ENV**               |                        | `local`                                                                                           |
| &nbsp;                     |                        |                                                                                                   |
| `# Application`            |                        |                                                                                                   |
| **APP_SCHEMA**             |                        | `http`                                                                                            |
| **APP_HOST**               |                        | `localhost`                                                                                       |
| **PORT**                   |                        | `80`                                                                                              |
| **APP_EXPOSED_PORT**       |                        | `80`                                                                                              |
| &nbsp;                     |                        |                                                                                                   |
| `# Logging`                |                        |                                                                                                   |
| **LOG_LEVEL**              |                        | `debug`                                                                                           |
| **LOG_OUTPUT**             |                        | `dev`                                                                                             |
| &nbsp;                     |                        |                                                                                                   |
| `# MySQL Database`         |                        |                                                                                                   |
| **KNEX_CONNECTION**        |                        | `mysql2`                                                                                          |
| **KNEX_USERNAME**          |                        |                                                                                                   |
| **KNEX_PASSWORD**          |                        |                                                                                                   |
| **KNEX_HOST**              |                        | `localhost`                                                                                       |
| **KNEX_PORT**              |                        | `3306`                                                                                            |
| **KNEX_DATABASE**          |                        | `lendsqr`                                                                                         |
| &nbsp;                     |                        |                                                                                                   |
| **KNEX_SYNCHRONIZE**       |                        | `false`                                                                                           |
| **KNEX_LOGGING**           |                        | `error`                                                                                           |
| **KNEX_LOGGER**            |                        | `advanced-console`                                                                                |
| **KNEX_MIGRATIONS**        |                        | `src/database/migrations/mysql/**/*.ts`                                                           |
| **KNEX_MIGRATIONS_DIR**    |                        | `src/database/migrations/mysql`                                                                   |
| **KNEX_ENTITIES**          |                        | `src/api/models/mysql/**/*.ts`                                                                    |
| **KNEX_ENTITIES_DIR**      |                        | `src/api/models/mysql`                                                                            |
| **KNEX_DISABLED**          |                        | `false`                                                                                           |
| &nbsp;                     |                        |                                                                                                   |
| `# Swagger`                |                        |                                                                                                   |
| **SWAGGER_ENABLED**        |                        | `true`                                                                                            |
| **SWAGGER_ROUTE**          |                        | `/swagger`                                                                                        |
| **SWAGGER_FILE**           |                        | `api/swagger.json`                                                                                |
| **SWAGGER_STATS_ROUTE**    |                        | `/swagger-stats/ui`                                                                               |
| &nbsp;                     |                        |                                                                                                   |



### Dependencies
- Node >=20.10.0
- MySQL 8

&nbsp;

## Cloning the Repository
Open your Terminal, and type:
`$ git clone https://github.com/django102/lendsqr-wallet.git`


## Commands
1. `yarn` - Installs all dependencies
2. `yarn test` - Run all tests currently available in the [test](test) folder
3. `yarn build` - Generates all JavaScript files from the TypeScript sources
4. `yarn serve` - run the application for development in the local development environment. It starts the application using Nodemon which restarts the server each time a change is made to a file
5. `yarn lint` - Runs linting.



### Database Migrations
You don't necessarily need to write your own scripts as running the `create-migration` script will create the database scripts based on the models. But you'll have to look through and ensure your scripts work as they should

- `create-migration`: generate generate a new migration file
  - You will need to supply a name for your migration, e.g. `npm run create-migration --name=name-of-script`
- `migrate`: run outstanding migrations for the database configured. `npm run migrate`
- `revert-migration`: rollback one database migration


&nbsp;

### Pushing Code
- This repo has pre-commit hooks that run a lint process over the codebase. So you might need to run `git add .` and `git commit -m "message here"` more than once to have all your commits + the linted code committed.
- Always create a new branch from the `main` branch, and create your PRs against both the `staging` and `main` branches.


&nbsp;

### Running

- `cd` into your new `lendsqr-wallet` directory
- Install the peer dependencies

  ```bash
  npm install yarn -g
  $ yarn
  ```

- Install dependencies

&nbsp;

### Configuration
Copy and rename `env.example` to `.env` and `.env.test`. Configure the remainder of variables as required.

&nbsp;

### Usage/Development

To build the application:
```bash
$ yarn build
```

Or to enable hot module reloading, install nodemon:
```bash
$ yarn add -g nodemon
```
and run `yarn serve` to start the application

To run your tests, run the command:
```bash
$ yarn test
```

&nbsp;

### See [here](README_LIBRARIES.md) for a list of important Libraries.