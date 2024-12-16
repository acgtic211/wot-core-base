import { WSClient_v1_0_0 } from "./WSClient_v1_0_0.js";

export class WSManager {

    constructor(config) {
        this.config = config;
        this.wsClient = new WSClient_v1_0_0();
    }

    


}