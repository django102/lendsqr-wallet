import "reflect-metadata";
import { bootstrapMicroframework } from "microframework-w3tec";

// import "./loaders/datadogLoader";
import { banner } from "./lib/banner";
import { Logger } from "./lib/logger";
import { catchAllLoader } from "./loaders/catchAllLoader";
import { eventDispatchLoader } from "./loaders/eventDispatchLoader";
import { expressLoader } from "./loaders/expressLoader";
import { iocLoader } from "./loaders/iocLoader";
import { mysqlLoader } from "./loaders/knexLoader";
import { metricsLoader } from "./loaders/metricsLoader";
import { swaggerLoader } from "./loaders/swaggerLoader";
import { winstonLoader } from "./loaders/winstonLoader";
import { buildSwagger } from "./utils/swaggerBuilder";


const log = new Logger();

// if (env.isDevelopment) {
buildSwagger();
// }

const loadersArr = [
    winstonLoader,
    iocLoader,
    eventDispatchLoader,
    expressLoader,
    metricsLoader,
    swaggerLoader,
    catchAllLoader,
    mysqlLoader,
];

bootstrapMicroframework({
    config: {
        showBootstrapTime: true,
        debug: true,
    },
    /**
   * Loader is a place where you can configure all your modules during microframework
   * bootstrap process. All loaders are executed one by one in a sequential order.
   */
    loaders: loadersArr,
})
    .then((framework) => {
        const signalTraps: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];
        signalTraps.map((signalType) => {
            process.once(signalType, () => framework.shutdown());
        });
        banner(log);
    })
    .catch(error => {
        console.log("error", error);
        log.error("Application has crashed: " + error);
    });
