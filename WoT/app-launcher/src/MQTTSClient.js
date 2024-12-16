import MQTT from 'mqtt';
import { MQTTClient_v1_0_0 } from './MQTTClient_v1_0_0.js';
/*import fs from 'fs';

var SERVER_KEY = fs.readFileSync('/usr/src/app-launcher/keys9/server.key','utf-8');

var SERVER_CERT = fs.readFileSync('/usr/src/app-launcher/keys9/server.crt', 'utf-8');

var CA_CERT = fs.readFileSync('/usr/src/app-launcher/keys9/rootCA.crt', 'utf-8');
*/
export class MQTTSClient extends MQTTClient_v1_0_0 {
    constructor() {
		super();
    }

    connect(hostname, port, resubscribe, externalServer) {
        let options = {
			protocolId: 'MQTT',
			protocolVersion: 5,
			connectTimeout: 5000,
			reconnectPeriod: 10000,
			keepalive: 5,
			resubscribe: false,
			rejectUnauthorized: false
		};
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws', options);
		  
		

        /*if(this.client === null) {
            this.externalServer = externalServer;
			console.log({
				"hostname": hostname,
				"port": port,
				"extermalServer": this.externalServer
			});
            if((this.externalServer === undefined) || (this.externalServer === false)){
				this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws', options);
				
            } else {
                this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws', options);
            }

        }*/
		
    }

    subscribe(topic, rap, rh) {
        return new Promise((resolve, reject) => {
            if(this.client !== null){
                if(this.client.connected === true) {
                    let options = {
						properties: {},
						rap: rap || false,
						rh: rh || 0
					};

                    if((this.externalServer === undefined) || (this.externalServer === false)) {
    					this.client.subscribe(topic, options, (err, granted) => {
    						if(err === null) {
    							resolve();
    						} else {
    							reject(err);
    						}
    					});
        		    } else {
    					this.client.subscribe(topic, undefined, (err, granted) => {
    						if(err === null) {
								// console.log(topic)    					    
    							resolve();
    						} else {
    							reject(err);
    						}
    					});
        		    }
                } else {
                    reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not connected...'));
                }
            } else {
                reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not connected...'));
            }
        })
    }



    publish(topic, message, responseTopic, retain) {
        return new Promise((resolve, reject) => {
            if(this.client !== null) {
                if(this.client.connected === true) {
                    let options = {
						properties: {},
						retain: retain || false
					};

					if(responseTopic !== undefined) {
						options.properties.responseTopic = responseTopic;
					}
                    if((this.externalServer === undefined) || (this.externalServer === false)) {
    					this.client.publish(topic, JSON.stringify( message ), options, (err) => {
    						if(err === undefined) {
    							resolve();
    						} else {
    							reject(err);
    						}
    					});
        		    } else {
    					this.client.publish(topic, JSON.stringify( message ), undefined, (err) => {
    						if(err === undefined) {
    							resolve();
    						} else {
    							reject(err);
    						}
    					});
        		    }
                } else {
                    reject(new Error('MQTTSClient.publish', 'Client not connected...'));
                }
            } else {
                reject(new Error('MQTTSClient.publish', 'Client not created...'));
            }
        });
    }


    unsubscribe(topic) {
		return new Promise((resolve, reject) => {
			if(this.client !== null) {
				let options = {
					properties: {
					}
				};

				if(this.client.connected === true) {
					this.client.unsubscribe(topic, options, (err) => {
						if(err === null) {
							resolve();
						} else {
							reject(err);
						}
					});
				} else {
					reject(new Error('MQTTClient_v1_0_0.unsubscribe', 'Client not connected...'));
				}
			} else {
				reject(new Error('MQTTClient_v1_0_0.unsubscribe', 'Client not created...'));
			}
		});
	}

    disconnect() {
		return new Promise((resolve, reject) => {
			
			if(this.client !== null) {
				let options = {
					properties: {}
				};

				// if(this.client.connected === true) {
					this.client.end(true, options, () => {
						resolve();
					});
				// } else {
					// resolve();
				// }
			} else {
				reject(new Error('MQTTClient_v1_0_0.disconnect', 'Client not created...'));
			}
		});
	}

	isConnected() {
		let connected = null;
		
		if(this.client === null) {
			connected = false;
		} else {
			connected = this.client.connected;
		}
		
		return(connected);
	}
}