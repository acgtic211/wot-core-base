'use strict';

import MQTT from 'mqtt';

export class MQTTClient_v1_0_0 {
	constructor() {
		this.client = null;
		this.externalServer = undefined;
	}
  
	connect(hostname, port, resubscribe, externalServer) {
		let options = {
			protocolId: 'MQTT',
			protocolVersion: 5,
			connectTimeout: 5000,
			reconnectPeriod: 10000,
			keepalive: 5,
			resubscribe: false,
			rejectUnauthorized: false,
			clientId: "mqttClientNormal" + Math.random().toString(16).substr(2, 8)
		};
		
		if(this.client === null) {
            this.externalServer = externalServer;
			
            if((this.externalServer === undefined) || (this.externalServer === false)) {
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    			this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws' , options);
				
		    } else {
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    			this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws' , options);
		    }
		}
	}
	
	setEvent(event, action) {
		switch(event) {
			case 'message':
				this.client.on(event, (topic, message, packet) => {
					//console.log('<- receive', JSON.parse(message))			
					action(this.client.options.hostname, this.client.options.port, topic, JSON.parse(message), packet);
				});
				break;
				
			default:
				this.client.on(event, action);
				break;
		}
	}

	subscribe(topic, rap, rh) {
		return new Promise((resolve, reject) => {
			if(this.client !== null) {
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
				reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not created...'));
			}
		});
	}

	publish(topic, message, responseTopic, retain) {
		return new Promise((resolve, reject) => {
// console.log('-> publish', topic, message, responseTopic, retain)			
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
					reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not connected...'));
				}
			} else {
				reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not created...'));
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
					reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not connected...'));
				}
			} else {
				reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not created...'));
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
				reject(new Error('MQTTClient_v1_0_0.subscribe', 'Client not created...'));
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