import type { Knex } from "knex";

import { TransactionType } from "../../../api/enums/TransactionType";


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
            table.boolean("isApproved").defaultTo(false).notNullable();
            table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
            table.timestamp("updatedAt").nullable();
        })
        .createTable("ledger", function (table) {
            table.increments("id").primary();
            table.string("reference", 250).notNullable();
            table.string("accountNumber", 250).notNullable();
            table.enum("transactionType", Object.values(TransactionType)).notNullable();
            table.string("description", 250).nullable();
            table.decimal("credit", 18).notNullable();
            table.decimal("debit", 18).notNullable();
            table.boolean("isReversed").defaultTo(false).notNullable();
            table.boolean("isDeleted").defaultTo(false).notNullable();
            table.timestamp("transactionDate").notNullable();
        })
    ;
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users").dropTable("ledger");
}