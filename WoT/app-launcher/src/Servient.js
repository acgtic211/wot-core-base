import { WoTConsumerUA } from './WoTConsumerUA.js';
import { WoTProducerUA } from './WoTProducerUA.js';

import { SecurityManager } from './SecurityManager.js';
import { ProtocolManager } from './ProtocolManager.js';

import { HTTPClient_v1_0_0 } from './HTTPClient_v1_0_0.js';
import { HTTPSClient } from './HTTPSClient.js';


export class Servient {
	constructor(config) {
		this.config = config;
		
		this.exposedThings = {};
		
		this.consumedThings = {};

		this.securityManager = new SecurityManager();
		this.protocolManager = new ProtocolManager(this.config.servientDescription.protocolManager);
		
		this.wotConsumerUA = new WoTConsumerUA(this.securityManager, this.protocolManager);
		this.wotProducerUA = new WoTProducerUA(this.securityManager, this.protocolManager);
	}


	
	initialize() {
		return new Promise((resolve, reject) => {
			
			this.initializeElementsOfExposedThings(this.config.exposedThings)
			.then(() => {
				this.initializeThingBehaviours()
				.then(() => {

					this.initializeThingUserInterfaces()
					.then(() => {
						this.initializeExposedThings()
						.then(() => {
							this.exposeExposedThings()
							.then(() => {
								this.initializeElementsOfConsumedThings(this.config.consumedThings)
								.then(() => {
                                    this.afterStartAllThings();
									resolve();
								})
								.catch((error) => {
									console.log('Error in consumed things elements initialization...');
									reject(error);
								});
							})
							.catch((error) => {
								console.log('Error in exposed things exposing...');
								reject(error);
							});
						})
						.catch((error) => {
							console.log('Error in exposed things initialization...');
							reject(error);
						});
					})
					.catch((error) => {
						console.log('Error in thing user interfaces initialization...');
						reject(error);
					});
    			})
    			.catch((error) => {
    				console.log('Error in thing behaviours initialization...');
    				reject(error);
    			});
    		})
    		.catch((error) => {
    			console.log('Error in exposed things elements initialization...');
    			reject(error);
    		});
    	});
	}
	
	afterStartAllThings() {
		/*console.log("=====================================================================");
		console.log("SERVIENT " + this.config.servientDescription.name);
		Object.keys(this.exposedThings).forEach((key) => {
			console.log(key);
			console.log("EXPOSED THING: " + this.exposedThings[key].id);

		})
		Object.keys(this.consumedThings).forEach((key) => {
			console.log("CONSUMED THINGS: " + this.consumedThings[key].id);
		})
		
		console.log("=====================================================================");*/

		this.config.servientDescription.afterStartAllThings.forEach((action) => {		
			let id = this.config.servientDescription.id + '__' + 'CT' + '__' + action.thingId;
			console.log(id);
			this.getConsumedThing(id).invokeAction(action.actionName, action.params)
			.then ((value) => console.log('[', id, ']', 'Thing invoked action', action.actionName))
			.catch ((error) => {
			    console.error('[', id, ']', error);
			    
			    return setTimeout(() => {
                    this.getConsumedThing(id).invokeAction(action.actionName, action.params);
                }, 10000);
			});
		});
	}
	
	beforeStopAllThings() {
	}
	
	terminate() {
		return new Promise((resolve, reject) => {
		    this.beforeStopAllThings();
		    
			this.terminateThingUserInterfaces()
			.then(() => {
				this.terminateThingBehaviours()
				.then(() => {
					this.terminateExposedThings()
					.then(() => {
						this.protocolManager.finalizeAllServices()
						.then(() => {
							console.log('Destruction finished for servient', this.config.servientDescription.id, '...');
							resolve();
						})
						.catch((error) => {
							console.log('Error in finalizeAllServices for servient', this.config.servientDescription.id, '...');
							reject(error);
						});
					})
					.catch((error) => {
						console.log('Error terminating Exposed Things for servient', this.config.servientDescription.id, '...');
						reject(error);
					});
				})
				.catch((error) => {
					console.log('Error terminating thing behaviours...');
					reject(error);
				});
			})
			.catch((error) => {
				console.log('Error terminating user interfaces...');
				reject(error);
			});
		});
	}
	
	initializeElementsOfExposedThings(exposedThings) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(exposedThings).forEach((exposedThing) => {
				//console.log(exposedThing);
				promises.push(this.initializeElementsOfExposedThing(exposedThings[exposedThing]));
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
	
	initializeElementsOfExposedThing(exposedThing) {
		
		return new Promise((resolve, reject) => {
			this.importModule(exposedThing.moduleName)
			.then((ThingBehaviour) => {
				this.wotProducerUA.produce(exposedThing.thingDescription, exposedThing.id)
				.then((thing) => {
					this.exposedThings[exposedThing.id] = {};
					this.exposedThings[exposedThing.id].id = exposedThing.id;
					this.exposedThings[exposedThing.id].thingDescriptionHref = exposedThing.thingDescriptionHref;
					this.exposedThings[exposedThing.id].thingDescription = exposedThing.thingDescription;
					
					this.exposedThings[exposedThing.id].thingBehaviour = new ThingBehaviour[exposedThing.filename](exposedThing.thingConfig, this.securityManager, this.protocolManager, (name) => thing.emitPropertyChange(name), (name, data) => thing.emitEvent(name, data));
					this.exposedThings[exposedThing.id].thingUserInterfaceHref = (this.getUILink(exposedThing.thingDescription.links) === undefined) ? undefined : (this.getUILink(exposedThing.thingDescription.links)).href;
					
					this.exposedThings[exposedThing.id].thingUserInterface = exposedThing.thingUserInterface;
					this.exposedThings[exposedThing.id].thing = thing;
					
					resolve();
				})
				.catch((error) => reject(error));
			})
			.catch((error) => reject(error));
		});
	}
	
	
	initializeThingBehaviours() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.initializeThingBehaviour(this.exposedThings[id]));
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
	
	initializeThingBehaviour(exposedThing) {
		return new Promise((resolve, reject) => {
			if(exposedThing.thingBehaviour.initialize === undefined) {
				resolve();
			} else {
				exposedThing.thingBehaviour.initialize()
				.then(() => resolve())
				.catch((error) => reject(error));
			}
		});
	}
	
	
	initializeThingUserInterfaces() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.initializeThingUserInterface(this.exposedThings[id]));
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
	
	initializeThingUserInterface(exposedThing) {
		return new Promise((resolve, reject) => {
			if(exposedThing.thingUserInterface !== undefined) {
				let uiLink = this.getUILink(exposedThing.thingDescription.links);
				
				if(
					(exposedThing.thingUserInterface.enabled === true) &&
					(exposedThing.thingUserInterface.userInterfaceDescription !== undefined) &&
					(uiLink !== undefined)
				) {
					let userInterface = this.getUserInterfaceHTML(exposedThing.thingUserInterface.userInterfaceDescription);
					
					let request = this.protocolManager.getRequest(exposedThing.id, undefined, undefined, {
						href: uiLink.href,
						contentType: uiLink.type
					}, undefined, undefined, undefined, undefined, undefined);
					
					let client = new HTTPClient_v1_0_0();
					let clientS = new HTTPSClient();

					if(request.port === '443'){
						clientS.register2(request.hostname, request.port, request.pathname, 'get', request.type, userInterface)
						.then(() => resolve())
						.catch((error) => reject(error));
					} else {
						client.register2(request.hostname, request.port, request.pathname, 'get', request.type, userInterface)
						.then(() => resolve())
						.catch((error) => reject(error));
					}
					
				} else {
					resolve();
				}
			} else {
				resolve();
			}
		});
	}
	
	
	initializeExposedThings(exposedThings) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.initializeExposedThing(this.exposedThings[id]));
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
	
	initializeExposedThing(exposedThing) {
		return new Promise((resolve, reject) => {
			const promises = [];

			let handler = undefined;

			Object.keys(exposedThing.thingDescription.properties).forEach((name) => {
				if(exposedThing.thingBehaviour.handlers[name] !== undefined) {
					handler = exposedThing.thingBehaviour.handlers[name].readHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setPropertyReadHandler(name, handler));
					}

					handler = exposedThing.thingBehaviour.handlers[name].writeHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setPropertyWriteHandler(name, handler));
					}

					handler = exposedThing.thingBehaviour.handlers[name].observeHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setPropertyObserveHandler(name, handler));
					}

					handler = exposedThing.thingBehaviour.handlers[name].unobserveHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setPropertyUnobserveHandler(name, handler));
					}
				}
			});

			Object.keys(exposedThing.thingDescription.actions).forEach((name) => {
				if(exposedThing.thingBehaviour.handlers[name] !== undefined) {
					handler = exposedThing.thingBehaviour.handlers[name].actionHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setActionHandler(name, handler));
					}
				}
			});

			Object.keys(exposedThing.thingDescription.events).forEach((name) => {
				if(exposedThing.thingBehaviour.handlers[name] !== undefined) {
					handler = exposedThing.thingBehaviour.handlers[name].subscribeHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setEventSubscribeHandler(name, handler));
					}
				
					handler = exposedThing.thingBehaviour.handlers[name].unsubscribeHandler;
					if(handler !== undefined) {
						promises.push(exposedThing.thing.setEventUnsubscribeHandler(name, handler));
					}
				}
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
	
	
	exposeExposedThings() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				//console.log("Exposing " + id);
				promises.push(this.exposedThings[id].thing.expose());
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

	
	
	
	initializeElementsOfConsumedThings(consumedThings) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(consumedThings).forEach((consumedThing) => {
				promises.push(this.initializeElementsOfConsumedThing(consumedThings[consumedThing]));
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
	
	initializeElementsOfConsumedThing(consumedThing) {
		return new Promise((resolve, reject) => {
			this.wotConsumerUA.consume(consumedThing.thingDescription, consumedThing.id)
			.then((thing) => {
				this.consumedThings[consumedThing.id] = {};
				this.consumedThings[consumedThing.id].id = consumedThing.id;
				this.consumedThings[consumedThing.id].thingDescriptionHref = consumedThing.thingDescriptionHref;
				this.consumedThings[consumedThing.id].thingDescription = consumedThing.thingDescription;
				this.consumedThings[consumedThing.id].thingUserInterfaceHref = (this.getUILink(consumedThing.thingDescription.links) === undefined) ? undefined : (this.getUILink(consumedThing.thingDescription.links)).href;
				this.consumedThings[consumedThing.id].thing = thing;

				resolve();
			})
			.catch((error) => reject(error));
		});
	}
	
	
	terminateThingUserInterfaces() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.terminateThingUserInterface(this.exposedThings[id]));
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
	
	terminateThingUserInterface(exposedThing) {
		return new Promise((resolve, reject) => {
			if(exposedThing.thingUserInterface !== undefined) {
				let uiLink = this.getUILink(exposedThing.thingDescription.links);
				
				if(
					(exposedThing.thingUserInterface.enabled === true) &&
					(exposedThing.thingUserInterface.userInterfaceDescription !== undefined) &&
					(uiLink !== undefined)
				) {
					let request = this.protocolManager.getRequest(exposedThing.id, undefined, undefined, {
						href: uiLink.href,
						contentType: uiLink.type
					}, undefined, undefined, undefined, undefined, undefined);
					
					let client = new HTTPClient_v1_0_0();
					let clientS = new HTTPSClient();

					if(request.port === '443') {
						clientS.unregister2(request.hostname, request.port, request.pathname, 'get', request.type)
						.then(() => resolve())
						.catch((error) => reject(error));
					} else {
						client.unregister2(request.hostname, request.port, request.pathname, 'get', request.type)
						.then(() => resolve())
						.catch((error) => reject(error));
					}
					
					
				} else {
					resolve();
				}
			} else {
				resolve();
			}
		});
	}
	
	
	terminateThingBehaviours() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.terminateThingBehaviour(this.exposedThings[id]));
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
	
	terminateThingBehaviour(exposedThing) {
		return new Promise((resolve, reject) => {
			if(exposedThing.thingBehaviour.terminate === undefined) {
				resolve();
			} else {
				exposedThing.thingBehaviour.terminate()
				.then(() => resolve())
				.catch((error) => reject(error));
			}
		});
	}

	
	terminateExposedThings() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			Object.keys(this.exposedThings).forEach((id) => {
				promises.push(this.exposedThings[id].thing.destroy());
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

	





	
	importModule(moduleName) {
		return new Promise((resolve, reject) => {
			import(moduleName)
			.then((module) => resolve(module))
			.catch((error) => reject(error));
		});
	}

	getUILink(links) {
		let link1 = undefined;
		if(links === undefined ) return undefined;
		links.forEach((link) => {
			if(link.rel === 'renderedBy') {
				link1 = link;
			}
		});
		
		return(link1);
	}

	
	getUserInterfaceHTML(userInterfaceDescription) {
		let userInterface = '';

		userInterface += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';

		userInterface += '<' + userInterfaceDescription.element;
		userInterfaceDescription.attributes.forEach((attribute) => {
			userInterface += '\n\t ' + attribute.key + '="' + attribute.value + '"';
		});
		userInterface += '\n></' + userInterfaceDescription.element + '>\n';
		userInterface += '<script type="module" src="' + userInterfaceDescription.src + '"></script>\n';

		return(userInterface);
	}


	
	
	
	

	
	getExposedThingByTDHref(thingDescriptionHref) {
		let ct = undefined;

		Object.keys(this.exposedThings).forEach((exposedThing) => {
			if(this.exposedThings[exposedThing].thingDescriptionHref === thingDescriptionHref) {
				ct = this.exposedThings[exposedThing];
			}
		});
		
		return(ct);
	}
	
	getConsumedThingByTDHref(thingDescriptionHref) {
		let ct = undefined;

		Object.keys(this.consumedThings).forEach((consumedThing) => {
			if(this.consumedThings[consumedThing].thingDescriptionHref === thingDescriptionHref) {
				ct = this.consumedThings[consumedThing];
			}
		});
		
		return(ct);
	}

/*	
	getExposedThings() {
		return this.exposedThings;
	}

	getConsumedThings() {
		return this.consumedThings;
	}
	
	getConsumedThing(id) {
		return this.consumedThings[id];
	}
	
	addConsumedThingSubscription(subscription) {
		this.consumedThingSubscriptions.push(subscription);
	}
*/
	
}