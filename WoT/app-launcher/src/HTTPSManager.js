import { HTTPSClient } from './HTTPSClient.js';
import { MQTTSClient } from './MQTTSClient.js';
import { HTTPManager } from './HTTPManager.js'

export class HTTPSManager extends HTTPManager{
	constructor(config) {
        super();
		this.config = config;
		
		this.hosts = {};
		
		this.client = new HTTPSClient();
	}

	
	
	find(hostname, port, thingId, topic, op) {
		let info = undefined;
		
		if(hostname !== undefined) {
			info = this.hosts[hostname];
			
			if(info !== undefined) {
				if(port !== undefined) {
					info = info[port];
					
					if(info !== undefined) {
						if(thingId !== undefined) {
							info = info[thingId];
						
							if(info !== undefined) {
								if(topic !== undefined) {
									info = info.topics[topic];
							
									if(info !== undefined) {
										if(op !== undefined) {
											info = info[op];
										}
									}
								}
							}
						}
					}
				}
			}
		}

		return(info);
	}

	register(hostname, port, thingId, mngTopic, topic, op, opInfo) {
		let info = undefined;
		
		if(hostname !== undefined) {
			info = this.find(hostname);
			
			if(info === undefined) {
				this.hosts[hostname] = {};
				
				info = this.find(hostname);
			}
				
			if(port !== undefined) {
				info = this.find(hostname, port);

				if(info === undefined) {
					info = this.find(hostname);
					
					info[port] = {};
			
					info = this.find(hostname, port);
				}
				
				if(thingId !== undefined) {
					info = this.find(hostname, port, thingId);
					
					if(info === undefined) {
						info = this.find(hostname, port);
						
						info[thingId] = {
							mqtt: undefined,
							firstConnection: false,
							topic: mngTopic,
							topics: {}
						};

						info = this.find(hostname, port, thingId);
					}
						
					if(topic !== undefined) {
						info = this.find(hostname, port, thingId, topic);
						
						if(info === undefined) {
							info = this.find(hostname, port, thingId);
							
							info.topics[topic] = {};

							info = this.find(hostname, port, thingId, topic);
						}
						
						if(op !== undefined) {
							info = this.find(hostname, port, thingId, topic, op);
							
							if(info === undefined) {
								info = this.find(hostname, port, thingId, topic);
								
								info[op] = {
									method: opInfo.method,
									type: opInfo.type,
									callbackOk: opInfo.callbackOk,
									params: opInfo.params,
									td: opInfo.td
								};
								
								info = this.find(hostname, port, thingId, topic, op);

								//console.log('info: ', info);
							}
						}
					}
				}
			}
		}
		
		return(info);
	}
	
	unregister(hostname, port, thingId, topic, op) {
		let info = undefined;
		
		if(op !== undefined) {
			info = this.find(hostname, port, thingId, topic, op);

			if(info !== undefined) {
				info = this.find(hostname, port, thingId, topic);
				
				delete info[op];

				if(Object.keys(info).length === 0) {
					info = this.find(hostname, port, thingId);
					
					delete info.topics[topic];
				}
			}
		} else {
			if(topic !== undefined) {
				info = this.find(hostname, port, thingId, topic);

				if(info !== undefined) {
					info = this.find(hostname, port, thingId);
					
					delete info.topics[topic];
				}
			} else {
				if(thingId !== undefined) {
					info = this.find(hostname, port, thingId);

					if(info !== undefined) {
						info = this.find(hostname, port);
						
						delete info[thingId];
					}
				} else {
					if(port !== undefined) {
						info = this.find(hostname, port);

						if(info !== undefined) {
							info = this.find(hostname);
							
							delete info[port];
						}
					} else {
						if(hostname !== undefined) {
							info = this.find(hostname);

							if(info !== undefined) {
								delete this.hosts[hostname];
							}
						}
					}
				}
			}
		}
	}
	
	
	
	

	bindGet(request) {
		return this.client.fetch(request.hostname, request.port, request.pathname, request.method, request.type, request.data);
	}
	
	bindPut(request) {
		
		return this.client.fetch(request.hostname, '443', request.pathname, request.method, request.type, request.data);
	}
	
	bindPost(request) {
		return this.client.fetch(request.hostname, request.port, request.pathname, request.method, request.type, request.data);
	}


	
	
	
	initHTTPSManager(mqttGatewayInfo, request) {
// console.log(this.hosts['192.168.101.92']['38090'].topics)		
// console.log(this.hosts['192.168.101.92']['38090'].topics['/bedroom-bulb-1/status']['readproperty']['bulb-1-exposed-thing-1'])		
		return new Promise((resolve, reject) => {
			if(mqttGatewayInfo === null) {
				
				reject('error');
			} else {
				if(this.find(request.hostname, request.port, request.thingId) === undefined) {
					//console.log('i1', request.thingId, request.name, request.pathname)			

					let info = this.register(request.hostname, request.port, request.thingId, mqttGatewayInfo.topic);

					info.mqtt = new MQTTSClient();
					info.mqtt.connect('mosquitto', mqttGatewayInfo.port, true);
					
					let interval = setTimeout(() => {
						
						info.mqtt.disconnect(request.hostname, request.port)
						.then((response) => {})
						.catch((error) => {})
						.finally(() => {
							// this.unregister(request.hostname, request.port);
							reject(new Error('Client not connected...', 'NetworkError'));
						});
					}, this.config.reconnectPeriod);



					info.mqtt.setEvent('connect', (connack) => {
 						console.log('connected to ' + request.pathname);						
						clearTimeout(interval);
									
						if(info.firstConnection === false) {
							info.firstConnection = true;

							let opInfo = {
								method: request.method,
								type: request.type,
								callbackOk: request.callbackOk,
								params: undefined,
								td: request.td
							};
							
							this.register(request.hostname, request.port, request.thingId, mqttGatewayInfo.topic, request.pathname, request.op, opInfo);

							

							info.mqtt.setEvent('message', (hostname, port, topic, message, packet) => {
// console.log('----->', hostname, port, topic, message)

								let op = this.find(request.hostname, request.port, message.thingId, message.pathname, message.op);
				
								if(op.callbackOk !== undefined) {
									let thingId = this.find(request.hostname, request.port, message.thingId);
									
									switch(message.op) {
										
										// ExposedThing
										
										case 'readproperty':
											op.callbackOk(message.id, undefined, op.td)
											.then((value) => {
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 200,
													content: value,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											})
											.catch((error) => {
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 404,
													content: error,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											});
											break;
										
										case 'writeproperty':
											op.callbackOk(message.id, message.params[message.id], undefined, 'single', op.td)
											.then((value) => {
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 200,
													content: value,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											})
											.catch((error) => {
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 404,
													content: error,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											});
											break;
											
										case 'invokeaction':
											op.callbackOk(message.id, message.params, undefined, op.td)
											.then((value) => {
												
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 200,
													content: value,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											})
											.catch((error) => { 
												console.log('******************* invokeaction', error)										    
												thingId.mqtt.publish(packet.properties.responseTopic, {
													status: 404,
													content: error,
													pathname: message.pathname,
													method: message.method,
													type: message.type
												})
												.then(() => {})
												.catch((error) => {});
											});
											break;
									}
								}
							});

							info.mqtt.setEvent('error', (error) => {
// console.log('error')								
							});
							
							info.mqtt.setEvent('close', () => {
// console.log('close')								
							});



							info.mqtt.subscribe(mqttGatewayInfo.topic)		
							.then(() => resolve())
							.catch((error) => {
								this.unregister(request.hostname, request.port, request.thingId, request.pathname, request.op);

								reject(error);
							});
						} else {
							resolve();
						}
					});
				} else {
					let info = this.find(request.hostname, request.port, request.thingId);
					let total = 0;
					
					if(info.mqtt.isConnected() === false) {
						let interval = setInterval(() => {
							total += 1000;

							if(total >= this.config.reconnectPeriod) {
								clearInterval(interval);
							}
							if(info.mqtt.isConnected() === false) {
								reject(new Error('Client not connected...', 'NetworkError'));
							} else {
								let opInfo = {
									method: request.method,
									type: request.type,
									callbackOk: request.callbackOk,
									params: null,
									td: request.td
								};
								
								this.register(request.hostname, request.port, request.thingId, mqttGatewayInfo.topic, request.pathname, request.op, opInfo);

								resolve();
							}
						}, 1000);
					} else {
						let opInfo = {
							method: request.method,
							type: request.type,
							callbackOk: request.callbackOk,
							params: null,
							td: request.td
						};
						
						this.register(request.hostname, request.port, request.thingId, mqttGatewayInfo.topic, request.pathname, request.op, opInfo);

						resolve();
					}
				}
			}
		});
	}	
	
	terminateHTTPSManager(hostname, port, thingId, topic) {
		return new Promise((resolve, reject) => {
			let info = this.find(hostname, port, thingId);

			if(info.mqtt !== undefined) {
				if(info.mqtt.isConnected() === true) {
					info.mqtt.unsubscribe(topic)		
					.then(() => {})
					.catch((error) => {})
					.finally(() => {
						info.mqtt.disconnect()
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
				} else {
					info.mqtt.disconnect()
					.then(() => resolve())
					.catch((error) => reject(error));
				}
			} else {
				resolve();
			}
		});
	}

	
	
	processSubscribe(mqttGatewayInfo, request) {
		return new Promise((resolve, reject) => {
			
			this.initHTTPSManager(mqttGatewayInfo, request)
			.then(() => {
				this.client.register(mqttGatewayInfo, request.hostname, request.port, request.pathname, request.method, request.type, request.thingId, request.name, request.op)
				.then(() => resolve())
				.catch((error) => {
					this.client.unregister(mqttGatewayInfo, request.hostname, request.port, request.pathname, request.method, request.type)
					.then(() => {})
					.catch((error2) => {})
					.finally(() => {
						reject(error);
					});
				});
			})
			.catch((error) => reject(error));
		});
	}
	
	processUnregisterThing(thingId) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			if(this.hosts !== undefined) {
				Object.keys(this.hosts).forEach((hostname) => {
					if(this.hosts[hostname] !== undefined) {
						Object.keys(this.hosts[hostname]).forEach((port) => {
							if(this.hosts[hostname][port] !== undefined) {
								// Object.keys(this.hosts[hostname][port]).forEach((thingId) => {
								if(this.hosts[hostname][port][thingId] !== undefined) {
									Object.keys(this.hosts[hostname][port][thingId].topics).forEach((topic) => {
										if(this.hosts[hostname][port][thingId].topics[topic] !== undefined) {
											Object.keys(this.hosts[hostname][port][thingId].topics[topic]).forEach((op) => {
											let method = this.hosts[hostname][port][thingId].topics[topic][op].method;
											let type = this.hosts[hostname][port][thingId].topics[topic][op].type;

											// console.log('******** terminateHTTPManager', hostname, port, topic, method, type)										
											promises.push(this.client.unregister(hostname, port, topic, method, type));


												this.unregister(hostname, port, thingId, topic, op);
											});
											
											this.unregister(hostname, port, thingId, topic);
										}
									});

									promises.push(new Promise((resolve, reject) => {
// console.log('******** terminateHTTPManager', hostname, port, thingId, this.hosts[hostname][port][thingId].topic)										
										this.terminateHTTPSManager(hostname, port, thingId, this.hosts[hostname][port][thingId].topic)
										.then(() => {})
										.catch((error) => {})
										.finally(() => {
											this.unregister(hostname, port, thingId);

											resolve();
										});
									}));
								}
								// });
							}
					
							// this.unregister(hostname, port);
						});
					}
					
					// this.unregister(hostname);
				});
			}
						
						
			Promise.allSettled(promises)
			.then((results) => {
				let errors = [];
				
				results.forEach((result) => {
					if(result.status === 'rejected') {
						errors.push(result.reason);
					}
				});

				if(errors.length === 0)
				{
					resolve();
				} else {
					reject(errors);
				}
			});
		});
	}

	
	

	
	initializeService(request) {
		return new Promise((resolve, reject) => {
			resolve();
		});
	}
	
	startService(request) {
		return new Promise((resolve, reject) => {
			let mqttGatewayInfo = {
				hostname: this.config.gateway.hostname,
				port: this.config.gateway.port,
				topic: '/' + request.thingId + this.config.gateway.topic
			};
			
			switch(request.op) {
				case 'readproperty':
				case 'writeproperty':
				case 'invokeaction':
					//console.log('....... ' + request.pathname);
					this.processSubscribe(mqttGatewayInfo, request)
					.then(() => resolve())
					.catch((error) => reject(error));
					break;
					
				case 'observeproperty':
				case 'unobserveproperty':
				case 'subscribeevent':
				case 'unsubscribeevent':
				default:
					resolve();
					break;
			}		
		});
	}
	
	exposeService(request) {
		return new Promise((resolve, reject) => {
			switch(request.op) {
				case 'readproperty':
				case 'writeproperty':
				case 'observeproperty':
				case 'unobserveproperty':
				case 'invokeaction':
				case 'subscribeevent':
				case 'unsubscribeevent':
				default:
					resolve();
					break;
			}		
		});
	}
	
	consumeService(request) {
		return new Promise((resolve, reject) => {

			switch(request.op) {
				case 'readproperty':
					this.bindGet(request)
					.then((response) => request.callbackOk(response))
					.catch((error) => request.callbackError(error));

					resolve();
					break;
					
				case 'writeproperty':
					this.bindPut(request)
					.then((response) => resolve())
					.catch((error) => reject(error));

					break;
					
				case 'invokeaction':
					this.bindPost(request)
					.then((response) => resolve(response))
					.catch((error) => reject(error));
					break;

				case 'observeproperty':
				case 'unobserveproperty':
				case 'subscribeevent':
				case 'unsubscribeevent':
				default:
					reject('ConsumeService HTTPS error...');
					break;
			}		
		});
	}
}