'use strict';

import MQTT from 'mqtt';

export class MQTTClient_v1_0_0 {
	constructor() {
		this.client = null;
	}
  
	connect(hostname, port) {
		let options = {
			protocolId: 'MQTT',
			protocolVersion: 5,
			connectTimeout: 5000,
			reconnectPeriod: 10000,
			keepalive: 0,
			resubscribe: false,
			rejectUnauthorized: false
		};
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		this.client = MQTT.connect('wss://acgsaas.ual.es:443/ws', options);
		
		// this.client.on('connect', (connack) => {
// console.log('connect');
		// });

		// this.client.on('offline', () => {
// console.log('offline');
		// });
		
		// this.client.on('error', (error) => {
// console.log('error');
		// });
	}
	
	setEvent(event, action) {
		this.client.on(event, action);
	}

	subscribe(topic) {
		return new Promise((resolve, reject) => {
			if(this.client !== null) {
				if(this.client.connected === true) {
					let options = {
						properties: {
						}
					};

					this.client.subscribe(topic, options, (err, granted) => {
						if(err === null) {
// console.log('subscribe', topic);
							resolve();
						} else {
							reject(err);
						}
					});
				} else {
					reject('err');
				}
			} else {
				reject('err');
			}
		});
	}

	publish(topic, message, responseTopic) {
		if(this.client !== null) {
			if(this.client.connected === true) {
				let options = {
					properties: {
					}
				};

				if(responseTopic !== undefined) {
					options.properties.responseTopic = responseTopic;
				}
// console.log(topic, message);
				this.client.publish(topic, message, options);
			} else {
//-->				
			}
		}
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
// console.log('unsubscribe', topic);
							resolve();
						} else {
// console.log('not unsubscribe', topic);
							reject(err);
						}
					});
				} else {
					resolve();
				}
			} else {
				reject('err');
			}
		});
	}

	disconnect() {
		return new Promise((resolve, reject) => {
			if(this.client !== null) {
				let options = {
					properties: {
					}
				};

				if(this.client.connected === true) {
					this.client.end(true, options, () => {
// console.log('end1')				
						resolve();
					});
				} else {
					resolve();
				}
			} else {
				reject('err');
			}
		});
	}
}