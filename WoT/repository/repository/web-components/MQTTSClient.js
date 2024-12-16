'use strict';

import 'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js';
const MQTT = mqtt;
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';


export class MQTTSClient extends MQTTClient_v1_0_0 {
    constructor() {
		super();
		
    }

    async connect(hostname, port, resubscribe, externalServer) {
        
		let options = {
			protocolId: 'MQTT',
			protocolVersion: 5,
			connectTimeout: 5000,
			reconnectPeriod: 10000,
			keepalive: 5,
			resubscribe: false,
			rejectUnauthorized: false
		};

		if(this.client === null) {
			this.externalServer = externalServer;
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
			this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws', options);
			/*if((this.externalServer === undefined) || (this.externalServer === false)){
				
				this.client = MQTT.connect('wss://' + hostname + ':' + port, options);
				
			} else {
				this.client = MQTT.connect('mqtts://' + hostname + ':' + port, {
					rejectUnauthorized: false,
					clientId: "mqttsClient" + Math.random().toString(16).substr(2, 8)
				});
			}*/
		}
		

    }

}