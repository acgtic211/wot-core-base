// 2 problemas con mqtt
// 		- invokeaction: output parametros no se pueden devolver
//		- writeproperty tiene que tener un path distinto a read u observe porque si no entra en bucle



import { MQTTClient_v1_0_0 } from './MQTTClient_v1_0_0.js';
	
	

export class MQTTManager {
	constructor(config) {
		this.config = config;
		
		this.hosts = {};
	}
	
	
	
	find(hostname, port, thingId, topic, op) {
		let info = undefined;
		
		if(hostname === undefined) {
			// nothing to do
		} else {
			info = this.hosts[hostname];
			
			if(info === undefined) {
				info = undefined;
			} else {
				if(port === undefined) {
					// nothing to do
				} else {
					info = info[port];
					
					if(info === undefined) {
						info = undefined;
					} else {
						if(thingId === undefined) {
							// nothing to do
						} else {
							if(info.thingIds === undefined) {
								info = undefined;
							} else {
								if(Object.keys(info.thingIds).length === 0) {
									info = undefined;
								} else {
									if(info.thingIds[thingId] === undefined) {
										info = undefined;
									} else {
										info = info.thingIds[thingId];
										
										if(info === undefined) {
											info = undefined;
										} else {
											if(topic === undefined) {
												// nothing to do
											} else {
												if(info.topics === undefined) {
													info = undefined;
												} else {
													if(Object.keys(info.topics).length === 0) {
														info = undefined;
													} else {
														if(info.topics[topic] === undefined) {
															info = undefined;
														} else {
															info = info.topics[topic];
															
															if(info === undefined) {
																info = undefined;
															} else {
																if(op === undefined) {
																	// nothing to do
																} else {
																	if(info[op] === undefined) {
																		info = undefined;
																	} else {
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
								}
							}
						}
					}
				}
			}
		}

		return(info);
	}

	register(hostname, port, thingId, topic, op, opInfo) {
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
					
					info[port] = {
						mqtt: undefined,
						firstConnection: false,
						thingIds: {}
					};
			
					info = this.find(hostname, port);
				}
				
				if(thingId !== undefined) {
					info = this.find(hostname, port, thingId);
					
					if(info === undefined) {
						info = this.find(hostname, port);
						
						info.thingIds[thingId] = {
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





	bindSubscribe(request, retain, resubscribe) {
		return new Promise((resolve, reject) => {
			let info = this.find(request.hostname, request.port);
			
			if(info === undefined) {
				reject(new Error('Client not exist...', 'NetworkError'));
			} else {
				if(info.mqtt.isConnected() === false) {
					reject(new Error('Client not connected...', 'NetworkError'));
				} else {
					let params;
					switch(request.op) {
						case 'readproperty':
							params = {
								response: undefined
							};
							break;
							
						case 'writeproperty':
							params = {
								name: request.name,
								value: undefined,
								options: request.options,
								mode: 'single', 
								td: request.td
							};
							break;

						case 'observeproperty':
							params = {
								data: undefined, 
								td: request.td
							};
							break;
							
						case 'invokeaction':
							params = {
								name: request.name,
								inputs: undefined,
								options: request.options,
								td: request.td
							};
							break;

						case 'subscribeevent':
							params = {
								data: undefined
							};
							break;
							
						default:
							params = undefined;
							break;
					}
					
					let opInfo = {
						method: request.method,
						type: request.type,
						callbackOk: request.callbackOk,
						callbackError: request.callbackError,
						params: params,
						td: request.td
					};
					
					this.register(request.hostname, request.port, request.thingId, request.pathname, request.op, opInfo);

					
					if(resubscribe === false) {
						info.mqtt.subscribe(request.pathname, retain, 1)
						.then(() => {
							console.log("Thing subscribed to event: ", request.pathname);
							resolve();
						})
						.catch((error) => {
							this.unregister(request.hostname, request.port, request.thingId, request.pathname, request.op);

							reject(error);
						});
					} else {
						return info.mqtt.unsubscribe(request.pathname)
						.then(() => {})
						.catch((error) => {})
						.finally(() => {
							info.mqtt.subscribe(request.pathname, retain, 1)
							.then(() => resolve())
							.catch((error) => {
								this.unregister(request.hostname, request.port, request.thingId, request.pathname, request.op);

								reject(error);
							});
						});
					}
				}
			}
		});
	}

	bindPublish(request, retain) {
		return new Promise((resolve, reject) => {
			let info = this.find(request.hostname, request.port);
			
			if(info === undefined) {
				reject(new Error('Client not exist...', 'NetworkError'));
			} else {
				if(info.mqtt.isConnected() === false) {
					reject(new Error('Client not connected...', 'NetworkError'));
				} else {
					//console.log('bind publish', request); 
					info.mqtt.publish(request.pathname, request.data, undefined, retain)
					.then(() => resolve())
					.catch((error) => reject(error));
				}
			}
		});
	}

	bindUnsubscribe(request) {
		return new Promise((resolve, reject) => {
			this.unregister(request.hostname, request.port, request.thingId, request.topic, request.op);
				
			let info = this.find(request.hostname, request.port);
			
			if(info.mqtt.isConnected() === false) {
				reject(new Error('Client not connected...', 'NetworkError'));
			} else {
				info.mqtt.unsubscribe(request.hostname, request.port, request.topic)
				.then(() => resolve())
				.catch((error) => reject(error));
			}
		});
	}
	
	
	
	
	
	processUnregisterThing(thingId) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.hosts).forEach((hostname) => {
				Object.keys(this.hosts[hostname]).forEach((port) => {
					Object.keys(this.hosts[hostname][port].thingIds).forEach((thingId2) => {
						if(thingId === thingId2) {
							Object.keys(this.hosts[hostname][port].thingIds[thingId].topics).forEach((topic) => {
								Object.keys(this.hosts[hostname][port].thingIds[thingId].topics[topic]).forEach((op) => {
									promises.push(this.bindUnsubscribe({
										hostname: hostname, 
										port: port, 
										thingId: thingId, 
										topic: topic, 
										op: op
									}));
								});
							});
						}
					});
				});
			});
						
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

	processUnregisterAll() {
		return new Promise((resolve, reject) => {
			const promises = [];

			Object.keys(this.hosts).forEach((hostname) => {
				Object.keys(this.hosts[hostname]).forEach((port) => {
					let info = this.find(hostname, port);

					if(info.mqtt.isConnected() === false) {
						promises.push(Promise.reject(new Error('Client not connected...', 'NetworkError')));
					} else {
						info.mqtt.disconnect(hostname, port)
						.then((response) => {
							promises.push(Promise.resolve());
						})
						.catch((error) => {
							promises.push(Promise.reject(error));
						})
						.finally(() => {
							this.unregister(hostname, port);
						})
					}
				});
			});
			
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
			switch(request.op) {
				case 'readproperty':
				case 'writeproperty':
				case 'observeproperty':
				case 'unobserveproperty':
				case 'invokeaction':
				case 'subscribeevent':
				case 'unsubscribeevent':
				default:
					if(this.find(request.hostname, request.port) === undefined) {
						// console.log('i1', request.thingId, request.name, request.pathname)			

						let externalServer = ((this.config.server.hostname === request.hostname) && (parseInt(this.config.server.port) === parseInt(request.port))) ? false : true;
						// console.log(this.config.server.hostname, this.config.server.port, request.hostname, request.port, externalServer)

						let info = this.register(request.hostname, request.port);
						
						info.mqtt = new MQTTClient_v1_0_0();
						info.mqtt.connect(request.hostname, request.port, true, externalServer);

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
							//console.log('connected')						
							clearTimeout(interval);
										
							if(info.firstConnection === false) {
								info.firstConnection = true;

								info.mqtt.setEvent('message', (hostname, port, topic, message, packet) => {
									//console.log('----->', hostname, port, topic, message)
										
									let ops = this.find(hostname, port);
									
									if(ops !== undefined) {
										Object.keys(ops.thingIds).forEach((thingId) => {
											Object.keys(ops.thingIds[thingId].topics).forEach((topic2) => {
												//console.log(topic2, topic)											    
												if(
												    ((topic2.charAt(topic2.length-1) === '#') && (topic.indexOf(topic2.substring(0, topic2.length-1)) === 0)) ||
												    (topic2 === topic)
												) {
													Object.keys(ops.thingIds[thingId].topics[topic2]).forEach((op) => {
														if(ops.thingIds[thingId].topics[topic2][op].callbackOk !== undefined) {
															//let thingId = this.find(hostname, port, thingId);
									
															switch(op) {
																// ExposedThing
																
																case 'writeproperty':
																	ops.thingIds[thingId].topics[topic2][op].callbackOk(
																		ops.thingIds[thingId].topics[topic2][op].params.name,
																		message,
																		ops.thingIds[thingId].topics[topic2][op].params.options,
																		ops.thingIds[thingId].topics[topic2][op].params.mode,
																		ops.thingIds[thingId].topics[topic2][op].params.td
																	);
																	break;
																	
																case 'invokeaction':
																	ops.thingIds[thingId].topics[topic2][op].callbackOk(
																		ops.thingIds[thingId].topics[topic2][op].params.name,
																		message,
																		ops.thingIds[thingId].topics[topic2][op].params.options,
																		ops.thingIds[thingId].topics[topic2][op].params.td
																	);
																	break;
																	
																	
																	
																// ConsumedThing
																
																case 'readproperty':
																	ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
																	break;
																
																case 'observeproperty':
																	ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
																	break;
																
																case 'subscribeevent':
																													    
																	ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
																	break;
															}
														}
													});
												}
											});
										});
									}
								});
									
									
								info.mqtt.setEvent('error', (error) => {
									switch(error.code) {
										case 'ECONNREFUSED':
											break;
											
										default:
											let ops = this.find(request.hostname, request.port);

											if(ops !== undefined) {
												Object.keys(ops.thingIds).forEach((thingId) => {
													Object.keys(ops.thingIds[thingId].topics).forEach((topic) => {
														Object.keys(ops.thingIds[thingId].topics[topic]).forEach((op) => {
															if(ops.thingIds[thingId].topics[topic][op].callbackError !== undefined) {
																ops.thingIds[thingId].topics[topic][op].callbackError(new Error('Client went offline...', 'NetworkError'));
															}
														});
													});
												});
											}
											break;
									}
								});
								
								
								info.mqtt.setEvent('close', () => {
									let ops = this.find(request.hostname, request.port);

									if(ops !== undefined) {
										Object.keys(ops.thingIds).forEach((thingId) => {
											Object.keys(ops.thingIds[thingId].topics).forEach((topic) => {
												Object.keys(ops.thingIds[thingId].topics[topic]).forEach((op) => {
													if(ops.thingIds[thingId].topics[topic][op].callbackError !== undefined) {
														ops.thingIds[thingId].topics[topic][op].callbackError(new Error('Client went offline...', 'NetworkError'));
													}
												});
											});
										});
									}
								});
							}
								
							resolve();
						});
					} else {
						let info = this.find(request.hostname, request.port);
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
									resolve();
								}
							}, 1000);
						} else {
							resolve();
						}
					}

					break;
			}
		});					
	}
	
	startService(request) {
		return new Promise((resolve, reject) => {
			switch(request.op) {
				case 'writeproperty':
				case 'invokeaction':
					this.bindSubscribe(request, false, false)
					.then(() => resolve())
					.catch((error) => reject(error));
					break;
					
				case 'readproperty':
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
		/*console.log("expose service");
		console.log(request);*/
		return new Promise((resolve, reject) => {
			switch(request.op) {
				case 'readproperty':
					this.bindPublish(request, true)
					.then(() => resolve())
					.catch((error) => reject(error));
					break;
					
				case 'observeproperty':
				case 'subscribeevent':
					this.bindPublish(request, false)
					.then(() => resolve())
					.catch((error) => reject(error));
					break;
					
				case 'writeproperty':
				case 'unobserveproperty':
				case 'invokeaction':
				case 'unsubscribeevent':
				default:
					resolve();
					break;
			}		
		});
	}
	
	consumeService(request) {
// console.log(this.hosts['192.168.101.92']['9001'].thingIds['servient-1-exposed-thing-1'].topics['/bedroom-servient-1/unlink'])
		return new Promise((resolve, reject) => {
			//console.log({"request":request});
			switch(request.op) {
				case 'readproperty':
				
					switch(request.method) {
						case 'SUBSCRIBE':
							switch(typeof request.formOp) {
								case 'string':
									this.bindSubscribe(request, true, true)
									.then(() => resolve())
									.catch((error) => reject(error));
									break;
									
								case 'object':
									let index = request.formOp.indexOf('observeproperty');
									
									if(index > -1) {
										reject('ERROR: You must use observeProperty...');
									} else {
										request.callbackOk0 = request.callbackOk;
										request.callbackError0 = request.callbackError;
										
										request.callbackOk = (response) => {
											this.bindUnsubscribe(request)
											.then(() => request.callbackOk0(response))
											.catch((error) => request.callbackError0(error));
										};
										
										request.callbackError = (error) => {
											this.bindUnsubscribe(request)
											.then(() => request.callbackOk0(response))
											.catch((error) => {
												let errors = [];

												errors.push(error);
												errors.push(error2);

												request.callbackError0(errors);
											});
										};
										
										this.bindSubscribe(request, true, true)
										.then(() => resolve())
										.catch((error) => reject(error));
									}
									break;
							}
							break;
					}
					break;
					
				case 'writeproperty':
					switch(request.method) {
						case 'PUBLISH':
							this.bindPublish(request, false)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
					
				case 'observeproperty':
					switch(request.method) {
						case 'SUBSCRIBE':
							this.bindSubscribe(request, false, false)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
								
				case 'unobserveproperty':
					switch(request.method) {
						case 'UNSUBSCRIBE':
							request.op = 'observeproperty';
							
							this.bindUnsubscribe(request)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
								
				case 'invokeaction':
					switch(request.method) {
						case 'PUBLISH':
							this.bindPublish(request, false)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
					
				case 'subscribeevent':
					
					switch(request.method) {
						case 'SUBSCRIBE':
							
							this.bindSubscribe(request, false, false)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
					
				case 'unsubscribeevent':
					switch(request.method) {
						case 'UNSUBSCRIBE':
							request.op = 'subscribeevent';
							
							this.bindUnsubscribe(request)
							.then(() => resolve())
							.catch((error) => reject(error));
							break;
					}
					break;
					
				default:
					reject('consumeServiceMQTT error...');
					break;
			}		
		});
	}
}