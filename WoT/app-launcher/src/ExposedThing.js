import { ConsumedThing } from './ConsumedThing.js';

export class ExposedThing extends ConsumedThing {
	constructor(td, id, securityManager, protocolManager) {
		super(td, id, securityManager, protocolManager);
	}

	
	setPropertyReadHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[name];
				
				if(this._td.properties[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.readHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing

	
	setPropertyWriteHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[name];
				
				if(this._td.properties[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.writeHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing

	
	setPropertyObserveHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[name];
				
				if(this._td.properties[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.observeHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing

	
	setPropertyUnobserveHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[name];
				
				if(this._td.properties[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.unobserveHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing

	
	emitPropertyChange(name) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let property = this._td.properties[name];
				
				if(property === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				let handler = null;
				
				if(property.observeHandler !== undefined) {
					handler = property.observeHandler;
				} else {
					if(property.readHandler !== undefined) {
						handler = property.readHandler;
					}
				}

				if(handler === null) {
					reject('handler is null');
				} else {
					let promise = handler(null);
					
					promise
					.then((data) => {
						// for each observer in property's internal observer list
							// Let options be the interaction options saved with observer.
							// Create a reply from data and options according to the Protocol Bindings.
							// Send reply to observer.
							
							// --------------------------------------------------------------------------------------------------
							let op = undefined;
							let form = undefined;

							if(property.observeHandler !== undefined) {
								op = 'observeproperty';
							} else {
								if(property.readHandler !== undefined) {
									op = 'readproperty';
								}
							}

// ************** cuidado si se define el observeHandler y no se define el affordance observeproperty en la thing description

							property.forms.forEach((form1) => {
								switch(typeof form1.op) {
									case 'string':
										if(form1.op === op) {
											form = form1;
										}
										break;
										
									case 'object':
										let index = form1.op.indexOf(op);
										
										if(index > -1) {
											form = form1;
										}
										break;
								}
							});
							
							const promises = [];
				
							promises.push(this.protocolManager.exposeService(this.id, name, op, form, data, undefined));

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
							// --------------------------------------------------------------------------------------------------
					})
					.catch((error) => reject(error));
				}
			}
		});
	}
	

	setActionHandler(name, action) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.actions[name];
				
				if(this._td.actions[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.actionHandler = action;

				resolve();
			}
		});
	} // return ExposedThing
	

	
	setEventSubscribeHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.events[name];
				
				if(this._td.events[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.subscribeHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing
	
	
	setEventUnsubscribeHandler(name, handler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.events[name];
				
				if(this._td.events[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.unsubscribeHandler = handler;

				resolve();
			}
		});
	} // return ExposedThing
	
	
	setEventHandler(name, eventHandler) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.events[name];
				
				if(this._td.events[name] === undefined) {
					reject(new Error('NotFoundError'));
				}
				
				interaction.eventHandler = eventHandler;

				resolve(interaction);
			}
		});
	} // return ExposedThing
	
	
	emitEvent(name, data) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.events[name];
				
				if(this._td.events[name] === undefined) {
					reject(new Error('NotFoundError'));
				} else {
					
					this.doEventListener(name, data);
					
					resolve();
				}
			}
		});
	}
	
	
	
	expose() {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				// Run the expand a TD steps on the internal slot [[td]]
				
				// Run the validate a TD on [[td]]. If that fails, reject promise with a TypeError and abort
				
				Object.keys(this._td.properties).forEach((propertyName) => {
					this._td.properties[propertyName]._internalObserverList = [];
				});
				
				Object.keys(this._td.events).forEach((eventName) => {
					this._td.events[eventName]._internalListenerList = [];
				});

				// Set up the WoT Interactions based on introspecting [[td]]
				
				// Make a request to the underlying platform to initialize the Protocol Bindings 
				// and then start serving external requests for WoT Interactions

				let callback = undefined;

				const promises = [];
				Object.keys(this._td.properties).forEach((name) => {
					this._td.properties[name].forms.forEach((form) => {
						let ops = [];
						switch(typeof form.op) {
							case 'string':	ops.push(form.op);	break;
							case 'object':	ops = form.op;		break;
						}
						
						ops.forEach((op) => {
							switch(op) {
								case 'readproperty':		callback = this.readServerProperty;		break;
								case 'writeproperty':		callback = this.updateServerProperty;	break;
								case 'observeproperty':		callback = this.doPropertyObserve;		break;
								case 'unobserveproperty':	callback = this.doPropertyUnobserve;	break;
								default:					callback = undefined;					break;
							}
							
							promises.push(this.protocolManager.startService(this.id, name, op, form, undefined, undefined, callback, undefined, this._td));
							
						});
					});
				});

				Object.keys(this._td.actions).forEach((name) => {
					this._td.actions[name].forms.forEach((form) => {
						let ops = [];
						switch(typeof form.op) {
							case 'string':	ops.push(form.op);	break;
							case 'object':	ops = form.op;		break;
						}
						
						ops.forEach((op) => {
							switch(op) {
								case 'invokeaction':		callback = this.doAction;				break;
								default:					callback = undefined;					break;
							}
							
							promises.push(this.protocolManager.startService(this.id, name, op, form, undefined, undefined, callback, undefined, this._td));
						});
					});
				});

				Object.keys(this._td.events).forEach((name) => {
					this._td.events[name].forms.forEach((form) => {
						let ops = [];
						switch(typeof form.op) {
							case 'string':	ops.push(form.op);	break;
							case 'object':	ops = form.op;		break;
						}
						
						ops.forEach((op) => {
							switch(op) {
								case 'subscribeevent':		callback = this.doEventSubscribe;		break;
								case 'unsubscribeevent':	callback = this.doEventUnsubscribe;		break;
								default:					callback = undefined;					break;
							}
							
							promises.push(this.protocolManager.startService(this.id, name, op, form, undefined, undefined, callback, undefined, this._td));
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
			}
		});
	}
	
	
	destroy() {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				this.protocolManager.stopAllServices(this.id)
				.then((response) => resolve())
				.catch((error) => reject(error));
			}
		});
	} // return Promise<undefined>
	
	

	getThingDescription() {
		return(this._td);
	} // return ThingDescription

	
	
	
	
	readServerProperty(name, options, td) {
		return new Promise((resolve, reject) => {
			let interaction = td.properties[name];
		
			if(interaction === undefined) {
				// Protocol Manager -> NotFoundError
				reject('NotFoundError');
			} else {
				let handler = null;
				
				if(interaction.readHandler !== undefined) {
					handler = interaction.readHandler;
				} else {
					// if there is a default read handler provided by the implementation
						// handler = that
				}
				
				if(handler === null) {
					// Protocol Manager -> NotSupportedError
					reject('NotSupportedError');
				} else {
					handler(options)
					.then((value) => {
						resolve(value);
					})
					.catch((error) => {
						// throw new Error(error);
						reject(error);
					});
				}
			}
		});
	}

	
	updateServerProperty(name, value, options, mode, td) {
		return new Promise((resolve, reject) => {
			// If this operation is not supported
			// Protocol Manager -> NotSupportedError
			
			// If this operation is not allowed
			// Protocol Manager -> NotAllowedError
			
			// let interaction = this._td.properties[name];
			let interaction = td.properties[name];
			
			if(interaction === undefined) {
				// Protocol Manager -> NotFoundError
				reject('NotFoundError');
			} else {
				let handler = null;
				
				if(interaction.writeHandler !== undefined) {
					handler = interaction.writeHandler;
				}
				
				if(handler === null) {
					// Protocol Manager -> NotSupportedError
					reject('NotSupportedError');
				} else {
					let promise = handler(name, value, options);
					
					promise
					.then((data) => {
						if(mode === 'single') {
							// Protocol Manager -> success
							resolve();
						}
					})
					.catch((error) => {
						// Protocol Manager -> error
						reject(error);
					});
				}
			}
		});
	}


	doPropertyObserve(name, options, td) {
// console.log('doPropertyObserve')		
		// If this operation is not supported
		// Protocol Manager -> NotSupportedError
		
		// If this operation is not allowed
		// Protocol Manager -> NotAllowedError
		
		let property = this._td.properties[name];
		
		if(property === undefined) {
			// Protocol Manager -> NotFoundError
		} else {
			// property._internalObserverList.push(request);
		}
	}


	doPropertyUnobserve(name, options) {
		// If this operation is not supported
		// Protocol Manager -> NotSupportedError
		
		// If this operation is not allowed
		// Protocol Manager -> NotAllowedError
		
		let property = this._td.properties[name];
		
		if(property === undefined) {
			// Protocol Manager -> NotFoundError
		} else {
			if(property.unobserveHandler !== undefined) {
				interaction.unobserveHandler(options)
				.then((value) => {
					// Protocol Manager -> ...
				})
				.catch((error) => {
					// Protocol Manager -> error
				});
			} else {
				// let sender = property._internalObserverList.findIndex((x) => x === y); 
				
				if(sender === undefined) {
					// Protocol Manager -> NotFoundError
				} else {
					property._internalObserverList.splice(sender, 1);

					// Protocol Manager -> ...
				}
			}
		}
	}
	

	doAction(name, inputs, options, td) {
		//console.log('-------------------------------->>>>>>>>', name, inputs, td)							
		return new Promise((resolve, reject) => {
			// If this operation is not supported
			// Protocol Manager -> NotSupportedError
			
			// If this operation is not allowed
			// Protocol Manager -> NotAllowedError
			
			// let interaction = this._td.actions[name];
			let interaction = td.actions[name];
			
			if(interaction === undefined) {
				// Protocol Manager -> NotFoundError
				reject('NotFoundError');
			} else {
				let handler = null;
				
				if(interaction.actionHandler !== undefined) {
					handler = interaction.actionHandler
				}

				if(handler === null) {
					// Protocol Manager -> NotSupportedError
				} else {
					handler(name, inputs, options)
					.then((data) => {
						// Protocol Manager -> success
						resolve(data);
					})
					.catch((error) => {
						// Protocol Manager -> error
						reject(error);
					});
				}
			}
		});
	}


	doEventSubscribe(name, options) {
		// If this operation is not supported
		// Protocol Manager -> NotSupportedError
		
		// If this operation is not allowed
		// Protocol Manager -> NotAllowedError

		let interaction = this._td.events[eventName];
		
		if(interaction === undefined) {
			// Protocol Manager -> NotFoundError
		} else {
			if(interaction.subscribeHandler !== undefined) {
				interaction.subscribeHandler(options);
			} else {
				let subscriber = {
					options: options
					// ...
				};
				
				interaction._internalListenerList.push(subscriber);
			}
		}
	}


	doEventUnsubscribe(name, options) {
		// If this operation is not supported
		// Protocol Manager -> NotSupportedError
		
		// If this operation is not allowed
		// Protocol Manager -> NotAllowedError

		let interaction = this._td.events[eventName];
		
		if(interaction === undefined) {
			// Protocol Manager -> NotFoundError
		} else {
			if(interaction.unsubscribeHandler !== undefined) {
				interaction.unsubscribeHandler(options);
			} else {
				// let subscriber = property._internalListenerList.findIndex((x) => x === y); 
				
				if(subscriber === undefined) {
					// Protocol Manager -> NotFoundError
				} else {
					property._internalListenerList.splice(subscriber, 1);

					// Protocol Manager -> subscriber
				}
			}
		}
	}


	doEventListener(name, data) {
		//console.log('doEventListener', name, data);	    
		let interaction = this._td.events[name];
		
		if((data === undefined) || (data === null)) {
			let eventHandler = interaction.eventHandler;
			//console.log("Event Handler", eventHandler);
			if(eventHandler === undefined) {
				
			} else {
				handler()
				.then((data2) => {
					data = data2;
				})
				.catch((error) => {});
			}
		}
		
		//console.log('doEventListener2', data);

		interaction._internalListenerList.forEach((subscriber) => {
			// Create an Event notification response
			// Send response to the subscriber
		});
							
			// -----------------------------------------------------------------------------------------------------------------
			let op = 'subscribeevent';
			let form = undefined;
			
			interaction.forms.forEach((form1) => {
				switch(typeof form1.op) {
					case 'string':
						if(form1.op === op) {
							form = form1;
						}
						break;
						
					case 'object':
						let index = form1.op.indexOf(op);
						
						if(index > -1) {
							form = form1;
						}
						break;
				}
			});							
							
			const promises = [];
			/*console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
			console.log(this.id, name, op, form, data, undefined);
			console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");*/

			promises.push(this.protocolManager.exposeService(this.id, name, op, form, data, undefined));

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
					// resolve();
				} else {
					// reject(errors);
				}
			});
			// -----------------------------------------------------------------------------------------------------------------
	}

}
