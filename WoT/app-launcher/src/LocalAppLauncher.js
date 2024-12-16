'use strict';

import { HTTPClient_v1_0_0 } from './HTTPClient_v1_0_0.js';

import { Servient } from './Servient.js';

import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';


export class LocalAppLauncher {
	constructor(config) {
		this.config = config;
		this.appDescriptionHref = undefined;
		this.appDescription = undefined;
		
		this.app = null;

		this.servientInformation = {};
		this.servientInstances = {};
		
		this.disabledServients = {};
		this.enabledServients = {};

		this.systemManagementServients = {};
	}

	
	initialize() {
		return new Promise((resolve, reject) => {
			console.log('AppLauncher initiated...');

			resolve();
		});
	}
	
	start() {
		return new Promise((resolve, reject) => {
		    console.log('AppLauncher started...');
		    
			resolve();
		});
	}
	
	stop() {
		return new Promise((resolve, reject) => {
			this.stopAllServients()
			.then(() => {})
			.catch((error) => {})
			.finally(() => resolve())
		});
	}
	
	terminate() {
		return new Promise((resolve, reject) => {
			// ...
			
			resolve();
		});
	}
	
	
	
	
	loadAppDescription(appDescriptionHref) {
		return new Promise((resolve, reject) => {
			this.stopAllServients()
			.then(() => {
    			this.unloadAllServients()
    			.then(() => {
        			this.readAppDescription(appDescriptionHref)
        			.then((appDescription) => {
                		this.appDescriptionHref = appDescriptionHref;
                		this.appDescription = appDescription;
        			    //Load System Management Servients
						
						this.loadSystemManagementServients()
						.then(() => {
							this.loadAllServients()
							.then(() => {
								this.config.appDescriptionHref = appDescriptionHref;
								resolve();
							})
							.catch((error) => reject(error));
						})
						.catch((error) => reject(error));
        			})
        			.catch((error) => reject(error));
    			})
    			.catch((error) => reject(error));
			})
			.catch((errors) => reject(error));
		});
	}

	loadSystemManagementServients() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			this.appDescription.systemManagementServients.forEach((sysManServientHref) => {
				promises.push(this.loadSystemManagementServient(sysManServientHref))
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
					reject(errors)
				}
			});
		})
	}

	loadSystemManagementServient(sysManServientHref) {
		return new Promise((resolve, reject) => {
			this.readServientDescription(sysManServientHref)
			.then((sysManServientDescription) => {
				this.registerSystemManagementServient(sysManServientDescription, sysManServientHref);
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
		});
	}
	
	loadServient(servientDescriptionHref) {
		return new Promise((resolve, reject) => {
			this.readServientDescription(servientDescriptionHref)
			.then((servientDescription) => {
				let servientName = servientDescription.name;
				

				this.registerServientInformation(servientName, servientDescriptionHref, servientDescription);

				this.readThingDescriptionsOfExposedThings(servientName, servientDescription.exposedThings)
				.then(() => {
					this.readThingDescriptionsOfConsumedThings(servientName, servientDescription.consumedThings)
					.then(() => {
						this.downloadImplementationsOfExposedThings(servientName)
						.then(() => {
							this.readThingConfigsOfExposedThings(servientName)
							.then(() => {
								this.readThingUserInterfacesOfExposedThings(servientName, servientDescription.exposedThings);
								// this.readThingUserInterfacesOfConsumedThings(servientId);
								
								this.registerDisabledServient(servientName);
								console.log("Servient %s loaded", servientName);
								resolve();
							})
							.catch((error) => {
								console.log('Error reading config of exposed things...');
								reject(error);
							});
						})
						.catch((error) => {
							console.log('Error donwloading implementations of exposed things...');
							reject(error);
						});
					})
					.catch((error) => reject(error));
				})
				.catch((error) => reject(error));
			})
			.catch((error) => reject(error));
		});
	}
	
	loadAllServients() {
		return new Promise((resolve, reject) => {
			const promises = [];

			this.appDescription.servientDescriptions.forEach((servientDescriptionHref) => {
				promises.push(this.loadServient(servientDescriptionHref));
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
					reject(errors)
				}
			});
		});
	}

	
	startServient(servientName, servient_ID) {
		return new Promise((resolve, reject) => {
			let servientInstance = new Servient(this.servientInformation[servientName]);
			
			servientInstance.initialize()
			.then(() => {
				
				this.registerServientInstance(servientName, servientInstance);

				this.unregisterDisabledServient(servientName);
				this.registerEnabledServient(servientName);

				if(this.existDisabledServients() === false) {
					
					this.afterStartAllServients();
				}

				resolve();
			})
			.catch((error) => {
				console.log(error)					    
				reject(error)
			});
		});
	}

	startSystemManagementServient(servientName) {
		return new Promise(async (resolve, reject) => {
			var sysManServient = new Servient(this.systemManagementServients[servientName]);
			this.systemManagementServients[servientName].servient = sysManServient;
			//Aqui se deberian generar las credenciales de cada servient y registrarse en el TIS para luego cuando se inicien (startServient) darle su clave publica correspondiente
			await Object.keys(this.disabledServients).forEach(async (servient) => {		
				var newSvnt = await sysManServient.securityManager.registerServient(this.servientInformation[servient].servientDescriptionHref, servient);
				sysManServient.config.registeredServients[servient] = newSvnt[0];
				//sysManServient.securityManager.servientList.push(newSvnt[0]);
				this.servientInformation[servient].publicKey = newSvnt[1];
				this.servientInformation[servient].servient_ID = newSvnt[0].servient_ID;
				//this.servientInformation[servient].privateKey = newSvnt.servient_privateKey;
			});
			
			resolve();

		});
	}
	
	startAllServients() {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			this.startAllSystemManagementServients()
			.then(() => {
				
				Object.keys(this.disabledServients).forEach((servientName) => {
					promises.push(this.startServient(servientName, this.servientInformation[servientName].servient_ID));
				});
				//console.log(this.servientInformation);
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
						reject(errors)
					}
				});
			})
			.catch((error) => {
				reject(error);
			})
		});
	}

	startAllSystemManagementServients() {
		return new Promise((resolve, reject) => {
			const sysManPromises = [];

			Object.keys(this.systemManagementServients).forEach((servientName) => {
				sysManPromises.push(this.startSystemManagementServient(servientName));
			});

			Promise.allSettled(sysManPromises)
			.then((results) => {
				var errors = [];

				results.forEach((result) => {
					if(result.status === 'rejected') {
						errors.push(result.reason);
					}
				});

				if(errors.length === 0) {
					resolve();
				} else {
					reject(errors);
				}
			});
		});
	}

	async encryptedCommSetUp(action) {
		if(action.params.encrypt) {
			var targetServients = [];
			var a = action;
			a.params.targets.forEach((target) => {
				
				if(!targetServients.includes(this.servientInstances[target.servientName]) && this.servientInstances[target.servientName] !== undefined){
					targetServients.push(this.servientInstances[target.servientName]);
				} else if(this.servientInstances[target.servientName] === undefined) {
					
					var ind = a.params.targets.indexOf(target);
					a.params.targets.splice(ind, 1);
					console.log("The servient " + target.servientName + " does not exist.");

				}
			});

			for(const servient of targetServients) {
				var pubN = servient.config.servient_ID;
				var pubK = servient.config.publicKey;

				//Test si el id del servient no esta registrado
				/*if(servient.config.id == 'Servient_6') {
					pubN = "Holi"
					
				}*/
				
				var encryptedMsg = await this.systemManagementServients['TIS Servient'].servient.securityManager.encryptMessage(pubK, pubN);

				var encryptedRes = await this.systemManagementServients['TIS Servient'].servient.securityManager.checkServientIdentity(encryptedMsg, pubN);

				//Esto es para testear si la comprobacion de identidad es false
				/*if(servient.config.id == 'Servient_6') {
					encryptedRes = false;
					
				}*/

				console.log("Enlace servient " + pubN + " ha sido " + encryptedRes);
				if(!encryptedRes) {
					console.log("Communication declined for the servient " + pubN);
					
					var paramToBeDeleted = a.params.targets.filter(obj => obj.servientName === servient.config.id);
					var ind = a.params.targets.indexOf(paramToBeDeleted[0]);
					//a.params.targets[ind].trusted = false;
					a.params.targets.splice(ind, 1);
					
				}
			}
			
			return a;
			
		} else {
			return action;
		}
	}

	
	async afterStartAllServients() {
		this.appDescription.afterStartAllServients.forEach(async(action) => {
			
			Object.keys(this.servientInstances).forEach(async(servientId) => {
				let consumedThing = this.servientInstances[servientId].getExposedThingByTDHref(action.thingDescription);
				if(consumedThing === undefined) {
    				consumedThing = this.servientInstances[servientId].getConsumedThingByTDHref(action.thingDescription);
				}
				
				if(consumedThing !== undefined) {
					var act = action;
					if(act.params.encrypt) {						
						act = await this.encryptedCommSetUp(action);
						//console.log(act.params);
					}

					//console.log('action:', act);

					consumedThing.thing.invokeAction(act.actionName, act.params)
					.then ((value) => {
						
						value.value()
						.then ((value) => {
							console.log('[', consumedThing.id, ']', 'Thing invoked action', action.actionName, ':', value);
						})
						.catch ((error) => {
							console.log('[', consumedThing.id, ']', 'Thing invoked action', action.actionName);
							console.error(error);
						});
					})
					.catch ((error) => {
						console.error('[', consumedThing.id, ']', error);
						
						return setTimeout(() => {
							consumedThing.thing.invokeAction(action.actionName, action.params)
							.then ((value) => {
								value.value()
								.then ((value) => {
																console.log('[', consumedThing.id, ']', 'Thing invoked action', action.actionName, ':', value);
								})
								.catch ((error) => {
																console.log('[', consumedThing.id, ']', 'Thing invoked action', action.actionName);
									console.error(error);
								});
							})
							.catch ((error) => {
								console.error('[', consumedThing.id, ']', error);
							});
						}, 10000);
					});

					
				} else {
// Error...
				}
			});
		});
	}

	
	beforeStopAllServients() {
	}
	
	
	stopServient(servientId) {
		return new Promise((resolve, reject) => {
			let num = this.getNumEnabledServients();

			if(num === 1) {
				this.beforeStopAllServients();
			}

			this.servientInstances[servientId].terminate()
			.then((values) => {
				this.unregisterServientInstance(servientId);

				this.unregisterEnabledServient(servientId);
				this.registerDisabledServient(servientId);
				
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
		});
	}
	
	stopAllServients() {
		return new Promise((resolve, reject) => {
			const promises = [];
		
			Object.keys(this.enabledServients).forEach((servientId) => {
				promises.push(this.stopServient(servientId));
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
					reject(errors)
				}
			});
		});
	}

	
	unloadServient(servientId) {
		return new Promise((resolve, reject) => {
			this.unregisterDisabledServient(servientId);

			resolve();
		});
	}
	
	unloadAllServients() {
		return new Promise((resolve, reject) => {
			const promises = [];
		
			Object.keys(this.disabledServients).forEach((servientId) => {
				promises.push(this.unloadServient(servientId));
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
					reject(errors)
				}
			});
		});
	}
	
	
	readAppDescription(href) {
		return new Promise((resolve, reject) => {
			let httpClient = new HTTPClient_v1_0_0();
			
			if(href !== null) {
				httpClient.fetchURL(href, 'get', 'application/json', null)
				.then((json) => {
					if(json !== null) {
						resolve(json);
					} else {
						reject('App Description not found...');
					}
				})
				.catch((error) => reject(error));
			} else {
				reject('App Description not found...');
			}
		});
	}
	
	registerSystemManagementServient(servientDescription, servientHref) {
		if(this.systemManagementServients[servientDescription.name] === undefined) {
			this.systemManagementServients[servientDescription.name] = {};
			this.systemManagementServients[servientDescription.name].name = servientDescription.name;
			this.systemManagementServients[servientDescription.name].servientDescriptionHref = servientHref;
			this.systemManagementServients[servientDescription.name].servientDescription = servientDescription;
			this.systemManagementServients[servientDescription.name].registeredServients = {};
			//console.log(this.systemManagementServients[servientDescription.name]);
		}
	}


	registerServientInformation(servientId, servientDescriptionHref, servientDescription) {
		if(this.servientInformation[servientId] === undefined) {
			this.servientInformation[servientId] = {};				
			this.servientInformation[servientId].id = servientId;				
			this.servientInformation[servientId].servientDescriptionHref = servientDescriptionHref;
			this.servientInformation[servientId].servientDescription = servientDescription;
			this.servientInformation[servientId].exposedThings = {};				
			this.servientInformation[servientId].consumedThings = {};				
		}
	}

	registerExposedThingInformationInServientInformation(servientId, thingId, thingDescriptionHref, thingDescription) {
		if(this.servientInformation[servientId] !== undefined) {
			this.servientInformation[servientId].exposedThings[thingId] = {};				
			this.servientInformation[servientId].exposedThings[thingId].id = thingId;				
			this.servientInformation[servientId].exposedThings[thingId].thingDescriptionHref = thingDescriptionHref;
			this.servientInformation[servientId].exposedThings[thingId].thingDescription = thingDescription;
		}
	}

	registerConsumedThingInformationInServientInformation(servientId, thingId, thingDescriptionHref, thingDescription) {
		if(this.servientInformation[servientId] !== undefined) {
			this.servientInformation[servientId].consumedThings[thingId] = {};				
			this.servientInformation[servientId].consumedThings[thingId].id = thingId;				
			this.servientInformation[servientId].consumedThings[thingId].thingDescriptionHref = thingDescriptionHref;
			this.servientInformation[servientId].consumedThings[thingId].thingDescription = thingDescription;
		}
	}
	
	registerExposedThingImplementationInformationInServientInformation(servientId, thingId, filename, moduleName) {
		if(this.servientInformation[servientId] !== undefined) {
			if(this.servientInformation[servientId].exposedThings[thingId] !== undefined) {
				this.servientInformation[servientId].exposedThings[thingId].filename = filename;
				this.servientInformation[servientId].exposedThings[thingId].moduleName = moduleName;
			}
		}
	}
	
	registerExposedThingConfigutarionInformationInServientInformation(servientId, thingId, thingConfigHref, thingConfig) {
		if(this.servientInformation[servientId] !== undefined) {
			if(this.servientInformation[servientId].exposedThings[thingId] !== undefined) {
				this.servientInformation[servientId].exposedThings[thingId].thingConfigHref = thingConfigHref;
				this.servientInformation[servientId].exposedThings[thingId].thingConfig = thingConfig;
				
			}
		}
	}
	
	registerExposedThingUserInterfaceInformationInServientInformation(servientId, thingId, thingUserInterfaceHref, thingUserInterface) {
		if(this.servientInformation[servientId] !== undefined) {
			if(this.servientInformation[servientId].exposedThings[thingId] !== undefined) {
				this.servientInformation[servientId].exposedThings[thingId].thingUserInterfaceHref = thingUserInterfaceHref;
				this.servientInformation[servientId].exposedThings[thingId].thingUserInterface = thingUserInterface;
			}
		}
	}
	
	registerConsumedThingUserInterfaceInformationInServientInformation(servientId, thingId, thingUserInterfaceHref) {
		if(this.servientInformation[servientId] !== undefined) {
			if(this.servientInformation[servientId].consumedThings[thingId] !== undefined) {
				this.servientInformation[servientId].consumedThings[thingId].thingUserInterfaceHref = thingUserInterfaceHref;
			}
		}
	}

	registerServientInstance(servientId, servientInstance) {
		if(this.servientInstances[servientId] === undefined) {
			this.servientInstances[servientId] = servientInstance;
		}
	}
	
	existServientInstace(servientId) {
		let exists = false;
		
		if(this.servientInstances[servientId] !== undefined) {
			exists = true;
		}
		
		return(exists);
	}
	
	unregisterServientInstance(servientId) {
		if(this.servientInstances[servientId] !== undefined) {
			delete this.servientInstances[servientId];
		}
	}
	
	getNumEnabledServients() {
	    let num = Object.keys(this.enabledServients).length;
	    
		return(num);
	}


	
	registerDisabledServient(servientId) {
		this.disabledServients[servientId] = {};						
	}
	
	getNumDisabledServients() {
	    let num = Object.keys(this.disabledServients).length;
	    
		return(num);
	}
	
	existDisabledServients() {
		let exists = false;
		let num = this.getNumDisabledServients();
		
		if(num > 0) {
			exists = true;
		}
		
		return(exists);
	}
	
	unregisterDisabledServient(servientId) {
		delete this.disabledServients[servientId];
	}


	
	registerEnabledServient(servientId) {
		this.enabledServients[servientId] = {};						
	}
	
	unregisterEnabledServient(servientId) {
		delete this.enabledServients[servientId];
	}
	
	
	readServientDescription(href) {
		return new Promise((resolve, reject) => {
			let httpClient = new HTTPClient_v1_0_0();
			
			if(href !== null) {
				httpClient.fetchURL(href, 'get', 'application/json', null)
				.then((json) => {
					if(json !== null) {
						resolve(json);
					} else {
						reject('Servient description not found...');
					}
				})
				.catch((error) => reject(error));
			} else {
				reject('Servient description not found...');
			}
		});
	}
	
	readThingDescription(href) {
		return new Promise((resolve, reject) => {
			if(href !== null) {
				fetch(href)
				.then((response) => {
					try {
						let td = response.json();
						
						resolve(td);
					} catch(error) {
						reject(error);
					}
				})
				.catch((error) => reject(error));
			} else {
				reject('Thing description href not available...');
			}
		});
	}

	getImplementationLink(links) {
		let link1 = undefined;
		
		links.forEach((link) => {
			if(link.rel === 'implementedBy') {
				link1 = link;
			}
		});
		
		return(link1);
	}
	
	downloadImplementation(href, folder) {
		return new Promise((resolve, reject) => {
			let httpClient = new HTTPClient_v1_0_0();
			
			if(href !== null) {
				httpClient.fetchURL(href, 'get', 'text/plain', null)
				.then((text) => {
					let filename = path.basename(href);
					
					fs.writeFile(folder + filename, text, { encoding: 'utf8' })
					.then(() => resolve())
					.catch((error) => reject(error));
				})
				.catch((error) => reject(error));
			} else {
				reject('Implementation not found...');
			}
		});
	}

	readConfigFromFile(links) {
		return new Promise((resolve, reject) => {
			let link = this.getConfigLink(links);

			if(link === undefined) {
				reject(new Error('error al obtener el href del config'));
			} else {
				let httpClient = new HTTPClient_v1_0_0();
				
				httpClient.fetchURL(link.href, 'get', link.type, null)
				.then((config) => resolve( { href: link.href, config: config} ))
				.catch((error) => reject(new Error('error al leer el config')));
			}
		});
	}

	readDefaultConfigFromFile(links) {
		return new Promise((resolve, reject) => {
			let link = this.getDefaultConfigLink(links);

			if(link === undefined) {
				reject(new Error('error al obtener el href del default config'));
			} else {
				let httpClient = new HTTPClient_v1_0_0();

				httpClient.fetchURL(link.href, 'get', link.type, null)
				.then((config) => resolve( { href: link.href, config: config} ))
				.catch((error) => reject(new Error('error al leer el default config')));
				
			}
		});
	}

	getConfigLink(links) {
		let link1 = undefined;
		
		links.forEach((link) => {
			if(link.rel === 'configuredBy') {
				link1 = link;
			}
		});
		
		return(link1);
	}

	getDefaultConfigLink(links) {
		let link1 = undefined;
		
		links.forEach((link) => {
			if(link.rel === 'defaultConfiguredBy') {
				link1 = link;
			}
		});
		
		return(link1);
	}

	getUILink(links) {
		let link1 = undefined;
		
		links.forEach((link) => {
			if(link.rel === 'renderedBy') {
				link1 = link;
			}
		});
		
		return(link1);
	}


	readThingDescriptionsOfExposedThings(servientId, exposedThings) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			exposedThings.forEach((exposedThing) => {		
				promises.push(this.readThingDescriptionsOfExposedThing(servientId, exposedThing));
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
	
	readThingDescriptionsOfExposedThing(servientId, exposedThing) {
		return new Promise((resolve, reject) => {
			this.readThingDescription(exposedThing.thingDescriptionHref)
			.then((thingDescription) => {
				let thingId = servientId + '__' + 'ET' + '__' + thingDescription.id;
				this.registerExposedThingInformationInServientInformation(servientId, thingId, exposedThing.thingDescriptionHref, thingDescription);
				
				resolve();
			})
			.catch((error) => reject(error));
		});
	}
	
	
	readThingDescriptionsOfConsumedThings(servientId, consumedThings) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			consumedThings.forEach((consumedThing) => {		
				promises.push(this.readThingDescriptionsOfConsumedThing(servientId, consumedThing));
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
	
	readThingDescriptionsOfConsumedThing(servientId, consumedThing) {
		return new Promise((resolve, reject) => {
			this.readThingDescription(consumedThing.thingDescriptionHref)
			.then((thingDescription) => {
				let thingId = servientId + '__' + 'CT' + '__' + thingDescription.id;

				this.registerConsumedThingInformationInServientInformation(servientId, thingId, consumedThing.thingDescriptionHref, thingDescription);
				
				resolve();
			})
			.catch((error) => reject(error));
		});
	}
	
	
	downloadImplementationsOfExposedThings(servientId) {
		return new Promise((resolve, reject) => {
			const promises = [];

			Object.keys(this.servientInformation[servientId].exposedThings).forEach((thingId) => {
				promises.push(this.downloadImplementationsOfExposedThing(servientId, thingId));
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
	
	downloadImplementationsOfExposedThing(servientId, thingId) {
		return new Promise((resolve, reject) => {
			
			let link = this.getImplementationLink(this.servientInformation[servientId].exposedThings[thingId].thingDescription.links);
			
			if(link !== undefined) {
				this.downloadImplementation(link.href, this.config.moduleFolder)
				.then(() => {
					let filename = path.basename(link.href);
					let moduleName = '.' + this.config.moduleFolder + filename;
					let name = path.parse(filename).name;

					this.registerExposedThingImplementationInformationInServientInformation(servientId, thingId, name, moduleName);
					
					resolve();
				})
				.catch((error) => reject(error));
			} else {
				reject(new Error('ImplementationLink undefined...'));
			}
		});
	}
	
	
	readThingConfigsOfExposedThings(servientId) {
		return new Promise((resolve, reject) => {
			const promises = [];

			Object.keys(this.servientInformation[servientId].exposedThings).forEach((thingId) => {
				promises.push(this.readThingConfigsOfExposedThing(servientId, thingId));
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
	
	readThingConfigsOfExposedThing(servientId, thingId) {
		return new Promise((resolve, reject) => {
			this.readConfigFromFile(this.servientInformation[servientId].exposedThings[thingId].thingDescription.links)
			.then((result) => {
				this.registerExposedThingConfigutarionInformationInServientInformation(servientId, thingId, result.href, result.config);
				
				resolve(result.config);
			})
			.catch((error) => {
				this.readDefaultConfigFromFile(this.servientInformation[servientId].exposedThings[thingId].thingDescription.links)
    			.then((result) => {
					this.registerExposedThingConfigutarionInformationInServientInformation(servientId, thingId, result.href, result.config);
					
					resolve(result.config);
				})
				.catch((error) => reject(error));
			});
		});
	}
	
	
	readThingUserInterfacesOfExposedThings(servientId, exposedThings) {
		Object.keys(this.servientInformation[servientId].exposedThings).forEach((thingId) => {
			this.readThingUserInterfacesOfExposedThing(servientId, thingId, exposedThings);
		});
	}
	
	readThingUserInterfacesOfExposedThing(servientId, thingId, exposedThings) {
		let thingUserInterfaceHref = (this.getUILink(this.servientInformation[servientId].exposedThings[thingId].thingDescription.links) === undefined) ? undefined : (this.getUILink(this.servientInformation[servientId].exposedThings[thingId].thingDescription.links)).href;

		let thingUserInterface = undefined;
		
		exposedThings.forEach((exposedThing) => {
		    if(this.servientInformation[servientId].exposedThings[thingId].thingDescriptionHref === exposedThing.thingDescriptionHref) {
		        thingUserInterface = exposedThing.thingUserInterface;
		    }
		});
		
		this.registerExposedThingUserInterfaceInformationInServientInformation(servientId, thingId, thingUserInterfaceHref, thingUserInterface);
	}

}
