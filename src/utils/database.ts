import { Knex, knex } from "knex";
import Container from "typedi";

import { env } from "../env";

const myDB = env.db.mysql;

  
export const createMysqlConnection = async (): Promise<Knex> => {
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

    const db = knex(dataSource);
    await db.raw("SELECT 1");
    Container.set("defaultConnection", db);
    return db;
};

// export const dropDatabase = (connection: Knex) => {
//     return connection.dropDatabase();
// };

export const closeDatabase = (connection: Knex) => {
    return connection.destroy();
};
