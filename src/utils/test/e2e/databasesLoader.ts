
import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";

import { createMysqlConnection } from "../../database";

export const dbLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    await createMysqlConnection().then((connection) => {
        if (settings) {
            settings.setData("defaultConnection", connection);
            settings.onShutdown(() => connection.destroy());
        }
    });
};
