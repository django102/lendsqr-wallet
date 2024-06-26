import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable("users", function (table) {
            table.increments("id").primary();
            table.string("email", 250).notNullable();
            table.string("password", 250).notNullable();
            table.string("firstName", 250).notNullable();
            table.string("lastName", 250).notNullable();
            table.string("phoneNumber", 250).notNullable();
            table.string("accountNumber", 250).notNullable();
            table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
            table.timestamp("updatedAt").nullable();
        });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users");
}

