import * as path from "path";

import * as dotenv from "dotenv";

import * as pkg from "../package.json";

import {
    getOsEnv,
    getOsEnvOptional,
    getOsEnvWithDefault,
    getOsPathsWithDefault,
    getOsPathWithDefault,
    normalizePort,
    toBool,
    toNumber,
} from "./lib/env";

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
    path: path.join(
        process.cwd(),
        `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`
    ),
});


/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    isDevelopment: process.env.NODE_ENV === "development",
    app: {
        name: (pkg as any).name,
        displayName: (pkg as any).displayName,
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnvOptional("APP_HOST"),
        port: normalizePort(process.env.PORT || undefined),
        schema: getOsEnvOptional("APP_SCHEMA"),
        exposedPort: normalizePort(process.env.APP_EXPOSED_PORT || undefined),
        banner: toBool(getOsEnvOptional("APP_BANNER") || "true"),
        dirs: {
            mysql: {
                migrations: getOsPathsWithDefault("KNEX_MIGRATIONS", "src/database/migrations/mysql/**/*.ts"),
                migrationsDir: getOsPathWithDefault("KNEX_MIGRATIONS_DIR", "src/database/migrations/mysql"),
                entities: getOsPathsWithDefault("KNEX_ENTITIES", "src/api/models/mysql/**/*.ts"),
                entitiesDir: getOsPathWithDefault("KNEX_ENTITIES_DIR", "src/api/models/mysql"),
            },
            controllers: getOsPathsWithDefault("CONTROLLERS", "src/api/controllers/**/*Controller.ts,src/controllers/**/*Controller.ts"),
            middlewares: getOsPathsWithDefault("MIDDLEWARES", "src/middlewares/**/*Middleware.ts"),
            subscribers: getOsPathsWithDefault("SUBSCRIBERS", "src/api/subscribers/**/*Subscriber.ts"),
            interceptors: getOsPathsWithDefault("INTERCEPTORS", "src/interceptors/**/*Interceptor.ts"),
        },
    },
    log: {
        level: getOsEnv("LOG_LEVEL"),
        json: toBool(getOsEnvOptional("LOG_JSON")),
        output: getOsEnv("LOG_OUTPUT"),
        logglyToken: getOsEnvOptional("LOG_LOGGLY_TOKEN"),
        udpHost: getOsEnvOptional("LOG_UDP_HOST"),
        udpPort: getOsEnvOptional("LOG_UDP_PORT"),
        enabled: toBool(getOsEnvOptional("LOGGLY_ENABLED") || "true"),
    },
    db: {
        mysql: {
            type: getOsEnv("KNEX_CONNECTION"),
            host: getOsEnvOptional("KNEX_HOST"),
            url: getOsEnvOptional("KNEX_URL"),
            password: getOsEnv("KNEX_PASSWORD"),
            username: getOsEnv("KNEX_USERNAME"),
            port: toNumber(getOsEnvOptional("KNEX_PORT")),
            database: getOsEnvOptional("KNEX_DATABASE"),
            synchronize: toBool(getOsEnvOptional("KNEX_SYNCHRONIZE")),
            logging: toBool(getOsEnv("KNEX_LOGGING")),
            disabled: toBool(getOsEnv("KNEX_DISABLED")),
        }
    },
    swagger: {
        enabled: toBool(getOsEnv("SWAGGER_ENABLED")),
        route: getOsEnv("SWAGGER_ROUTE"),
        file: getOsEnv("SWAGGER_FILE"),
        swaggerStatsRoute: getOsEnv("SWAGGER_STATS_ROUTE"),
    },
    metrics: {
        datadog: {
            traceEnabled: toBool(getOsEnvOptional("DD_TRACE_ENABLED") || "true"),
            env: getOsEnvOptional("DD_ENV") || "prod",
            agentHost: getOsEnvOptional("DD_AGENT_HOST") || "datadog.private.paystack.co",
            traceAgentPort: getOsEnvOptional("DD_TRACE_AGENT_PORT") || 8126,
            traceLogLevel: getOsEnvOptional("DD_TRACE_LOG_LEVEL") || "error",
            logInjection: toBool(getOsEnvOptional("DD_LOGS_INJECTION") || "true"),
            traceReportHostName: toBool(getOsEnvOptional("DD_TRACE_REPORT_HOSTNAME") || "true"),
            service: getOsEnvOptional("DD_SERVICE") || "compliance",
        },
        statsd: {
            port: toNumber(getOsEnvOptional("STATSD_PORT") || "8125"),
        },
    },
    constants: {
        jwtHasher: getOsEnv("JWT_HASHER"),
    },
    redis: {
        clusterIp: getOsEnvWithDefault("REDIS_CLUSTER_IP", "127.0.0.1"),
        port: getOsEnvWithDefault("REDIS_PORT", "6379"),
        username: getOsEnvWithDefault("REDIS_USER", ""),
        password: getOsEnvWithDefault("REDIS_PASSWORD", ""),
    }
};