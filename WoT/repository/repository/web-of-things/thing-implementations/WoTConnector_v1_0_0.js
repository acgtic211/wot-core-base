import { ConsumedThing } from '../src/ConsumedThing.js';

import { HTTPClient_v1_0_0 } from '../src/HTTPClient_v1_0_0.js';

import { v4 as uuidv4 } from 'uuid';

import fetch from 'node-fetch';

import rsa from 'node-rsa';

import fs from 'fs';

export class WoTConnector_v1_0_0 {
	constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
	    this.datastore = {
	    };
	    
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
		
		this.emitPropertyChange = emitPropertyChange;
		this.emitEvent = emitEvent;

		this.handlers = {
			'link': {
				'actionHandler': (name, inputs, options) => this.link(name, inputs, options)
			},
			'unlink': {
				'actionHandler': (name, inputs, options) => this.unlink(name, inputs, options)
			}
		};
		
		// this.count = 0;
		
		// this.relations = [];
	}

	
	readThingDescription(href) {
		return new Promise((resolve, reject) => {
			let httpClient = new HTTPClient_v1_0_0();
			
			if(href !== null) {
				httpClient.fetchURL(href, 'get', 'application/json', null)
				.then((json) => {
					if(json !== null) {
						resolve(json);
					} else {
						reject('Thing description not found...');
					}
				})
				.catch((error) => {
				    reject(error);
				});
			} else {
				reject('Thing description not found...');
			}
		});
	}

	async securePairing(secured) {

		if(secured === undefined || secured === null) {
			return true;
		}

		var res = await fetch(secured.sourceID, { method: 'GET'});
		var sourceID = await res.json();

		var res1 = await fetch(secured.allowedID, { method: 'GET' });
		var targetAID = await res1.json();
		
		var paired = this.securityManager.pairing(sourceID.id, targetAID.allowedID)

		return paired		
	}


	link(name, inputs, options) {
		return new Promise((resolve1, reject1) => {
    		this.readThingDescription(inputs.source.thingDescription)
    		.then(async (sourceThingDescription) => {
                let targets = [];
    			let sourceId = uuidv4() + '__' + 'CT' + '__' + sourceThingDescription.id;
    			let sourceEventName = inputs.source.eventName || null;

    			if(sourceEventName === null) {
    				reject1('No source event...');
    			} else {
        			let promises = [];

        			inputs.targets.forEach((target) => {
						//console.log('CONNECTOR TARGET: ', target);

						promises.push(new Promise((resolve, reject) => {
							this.readThingDescription(target.thingDescription)
							.then((targetThingDescription) => {
								// this.count += 1;
								// let targetId = 'Servient_Example_1_CT__CT__Connector_1' + '__' + 'CT' + this.count + '__' + targetThingDescription.id;
								let targetId = uuidv4() + '__' + 'CT' + '__' + targetThingDescription.id;
								let targetPropertyName = target.propertyName || null;
								let targetActionName = target.actionName || null;
								
								if((targetPropertyName === null) && (targetActionName === null)) {
									reject('No target property or action...');
								} else {
									targets.push({
										targetId: targetId,
										targetThingDescription: targetThingDescription,
										targetPropertyName: targetPropertyName,
										targetActionName: targetActionName,
										params: target.params,
										conditions: target.conditions
									});

									resolve();
								}
							})
							.catch((error) => {
								reject(error);
							});
						}));
        			       		
        			});

        			Promise.allSettled(promises)
        			.then(async (values) => {
                        let sourceThing = new ConsumedThing(sourceThingDescription, sourceId, this.securityManager, this.protocolManager);

                        let targetThings = [];

						if(inputs.secured) {
								
							var sourceID_href = inputs.secured.sourceID;
							var allowedID_href = inputs.secured.allowedID;
		
							var res = await fetch(sourceID_href, { method: 'GET'});
							var sourceID = await res.json();
		
							var res1 = await fetch(allowedID_href, { method: 'GET' });
							var targetAID = await res1.json();
							
							var paired = this.securityManager.pairing(sourceID.id, targetAID.allowedID)
							
							if(!paired) {
								reject1('Devices not allowed for pairing...');
							}
		
						}

            			targets.forEach((target) => {
							
                			targetThings.push({
                			    targetThing: new ConsumedThing(target.targetThingDescription, target.targetId, this.securityManager, this.protocolManager),
                			    targetId: target.targetId,
                                targetPropertyName: target.targetPropertyName,
                                targetActionName: target.targetActionName,
                                params: target.params,
                                conditions: target.conditions
                			});
            			});

						var paired = await this.securePairing(inputs.secured);

						if(paired) {
							
							sourceThing.subscribeEvent(sourceEventName, 
								(eventData) => {
									//console.log({"eventData":eventData});
									eventData.value()
									.then ((value) => {
										//console.log('--------------- 2', value)							
										console.log('[', sourceId, ']', 'Thing received event', sourceEventName, ':', value);
										
										targetThings.forEach((targetThing) => {
	 //console.log(targetThing)
											let p = null;
											
											if(targetThing.params !== undefined) {
												p = targetThing.params;
											} else {
												p = value;
											}
											//console.log('---------------', p)
		
											let c = null;
											
											if(targetThing.conditions !== undefined) {
												c = targetThing.conditions;
											} else {
												c = [];
											}
	// console.log('---------------', targetThing.conditions)
	// console.log('---------------', c)
	
											if(targetThing.targetPropertyName !== null) {
												if(c.length === 0) {
													/*console.log({
														"targetThing":targetThing,
														"p": p
													});*/
													targetThing.targetThing.writeProperty(targetThing.targetPropertyName, p)
													.then (() => console.log('[', targetThing.targetId, ']', 'Thing write property', targetThing.targetPropertyName))
													.catch ((error) => console.error('[', targetThing.targetId, ']', error));
												} else {
	//console.log(value[c[0].key[0]][c[0].key[1]], c[0].value, p)        								        
													if(value[c[0].key[0]][c[0].key[1]] === c[0].value) {
														targetThing.targetThing.writeProperty(targetThing.targetPropertyName, p)
														.then (() => console.log('[', targetThing.targetId, ']', 'Thing write property', targetThing.targetPropertyName))
														.catch ((error) => console.error('[', targetThing.targetId, ']', error));
													}
												}
											} else {
												if(targetThing.targetActionName !== null) {
													console.log({
														"targetThing":targetThing,
														"p": p
													});
													if(c.length === 0) {
														targetThing.targetThing.invokeAction(targetThing.targetActionName, p)
														.then (() => console.log('[', targetThing.targetId, ']', 'Thing invoke action', targetThing.targetActionName))
														.catch ((error) => console.error('[', targetThing.targetId, ']', error));
													} else {
	// console.log(value[c[0].key[0]][c[0].key[1]], c[0].value, p)        								        
														if(value[c[0].key[0]][c[0].key[1]] === c[0].value) {
															targetThing.targetThing.invokeAction(targetThing.targetActionName, p)
															.then (() => console.log('[', targetThing.targetId, ']', 'Thing invoke action', targetThing.targetActionName))
															.catch ((error) => console.error('[', targetThing.targetId, ']', error));
														}
													}
												}
											}
										});
									})
									.catch ((error) => console.error('[', sourceId, ']', error));
								},
								(error) => console.error('[', sourceId, ']', error), 
								undefined
							)
							.then ((subscription) => {
								console.log('[', sourceId, ']', 'Thing subscribed to event', sourceEventName);
		
								resolve1();
							})
							.catch ((error) => {
								console.error('[', sourceId, ']', error);
								
								reject1(error);
							});
						}
						
    					
        			    
                        // resolve1();
        	        })
        			.catch((error) => {
        			    reject1(error);
                    });
        		}	
    		})
			.catch((error) => {
				reject1('No sourceThingDescription...');
			});
		});
	}


	unlink(name, inputs, options) {
		return new Promise((resolve, reject) => {
			let sourceThing = new ConsumedThing(inputs.source, this.securityManager, this.protocolManager);

			let sourceEventName = (Object.keys(inputs.source.events).length > 0) ? Object.keys(inputs.source.events)[0] : null;

			if(sourceEventName === null) {
				reject('No source event...');
			} else {
				sourceThing.unsubscribe(sourceEventName)
				.then (() => resolve())
				.catch ((error) => reject(error));
			}
		});
	}

	
/*	
	existRelation(id) {
		let exists = false;

		if(this.relations !== null) {
			if(this.relations[id] !== undefined) {
				exists = true;
			}
		}
		
		return(exists);
	}

	
	registerRelation(id, enabled, type, source, targets) {
		if(this.existRelation(id) === false) {
    		if(this.relations !== null) {
    			if(this.relations[id] === undefined) {
    				this.relations[id] = {};
    				this.relations[id].id = id;
    				this.relations[id].enabled = enabled
    				this.relations[id].type = type;
    				this.relations[id].source = source;
    				this.relations[id].targets = targets;
    			}
    		}
		}
	}
	
	
	unregisterRelation(id) {
		if(this.relations !== null) {
			delete this.relations[id];
		}
	}


	loadRelation(relation) {
		return new Promise((resolve1, reject1) => {
    		this.readThingDescription(relation.source.thingDescription)
    		.then((thingDescription) => {
    			let tdSource = new WoTThingDescription_v1_0_0(thingDescription);
    			let sourceAffordanceMetadata = tdSource.findAffordanceMetadata(tdSource.getId(), relation.source.id, relation.source.op);


                let targets = [];

    			let promises2 = [];

    			relation.targets.forEach((target) => {
                    promises2.push(new Promise((resolve2, reject2) => {
                		this.readThingDescription(target.thingDescription)
                		.then((thingDescription) => {
        					let tdTarget = new WoTThingDescription_v1_0_0(thingDescription);
        					let targetAffordanceMetadata = tdTarget.findAffordanceMetadata(tdTarget.getId(), target.id, target.op);
targetAffordanceMetadata.params = target.params;
    
                            targets.push(targetAffordanceMetadata);
                            
                			resolve2();
                		})
                		.catch((error) => {
                		    reject2(error);
                		});
                    }));        		
    			});

    			Promise.allSettled(promises2)
    			.then((values) => {
    			    if(targets.length > 0) {
                        this.registerRelation(relation.id, relation.enabled, relation.type, sourceAffordanceMetadata, targets);
    			    }
    			    
                    resolve1();
    	        })
    			.catch((error) => {
    			    reject1(error);
                });

    		})
    		.catch((error) => {
    		    reject1(error);
    		});
		});
	}


	startRelation(id) {
		return new Promise((resolve, reject) => {
			let promises = [];

		    if(this.relations[id].enabled === true) {
			    switch(this.relations[id].type) {
			        case 'run-once-on-init':
			        case 'run-once-on-terminate':
			            this.doSource(this.relations[id]);
			            break;

			        case 'forever':
			            promises.push(this.doSource(this.relations[id]));
			            break;
			            
			        default:
			            break;
			    }
		    }

			Promise.allSettled(promises)
			.then((values) => {
// console.log('All promises OK')			    
	        })
			.catch((error) => {
// console.log('All promises NOT OK')			    

            })
            .finally(() => {
			    resolve();
            });
		});
	}
*/


}