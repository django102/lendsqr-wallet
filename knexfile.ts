import { Knex } from "knex";

import { env } from "./src/env";

const myDB = env.db.mysql;


const dataSource: Knex.Config = {
    client: myDB.type,
    connection: {
        host: myDB.host,
        port: myDB.port,
        user: myDB.username,
        password: myDB.password,
        database: myDB.database,
    },
    migrations: {
        directory: env.app.dirs.mysql.migrationsDir,
        tableName: "zzz_migrations"
    },
    compileSqlOnError: false
};

const config: {[key: string]: Knex.Config} = {
    local: {
        client: dataSource.client,
        connection: dataSource.connection
    },
    staging: {
        client: dataSource.client,
        connection: dataSource.connection
    },
    production: {
        client: dataSource.client,
        connection: dataSource.connection
    }
};

module.exports = config;