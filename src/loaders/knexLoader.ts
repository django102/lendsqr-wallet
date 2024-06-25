import { Knex, knex } from "knex";
import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";
import Container from "typedi";

import { env } from "../env";

const myDB = env.db.mysql;


export const dataSource: Knex.Config = {
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

export const db = knex(dataSource);

export const mysqlLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    Container.set("defaultConnection", dataSource);

    try {
        await db.raw("SELECT 1");
        console.log("connected to mysql!");

        if(settings) {
            settings.setData("defaultConnection", db);

            settings.onShutdown(() => {
                db.destroy().then(() => {
                    console.log("disconnected from mysql!");
                });
            });
        }
    } catch (err) {
        console.log(`Error connecting to mysql DB ${err}`);
    }
};