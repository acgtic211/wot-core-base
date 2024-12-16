import { InteractionOutput, createInteractionRequest, parseInteractionResponse } from './InteractionOutput.js';
import { Subscription } from './Subscription.js';

export class ConsumedThing {
	constructor(td, id, securityManager, protocolManager) {
		this._td = undefined;
		this.id = undefined;
		this.securityManager = undefined;
		this.protocolManager = undefined;
		
		this._td = td;
		this.id = id;
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
	}

	
	readProperty(propertyName, options) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[propertyName];

				let form = undefined;
				
				if(
					(options !== undefined) &&
					(options.formIndex !== undefined)
				){
					if(
						(this._td.properties[propertyName] !== undefined) && 
						(this._td.properties[propertyName].forms[options.formIndex] !== undefined)
					) {
						form = this._td.properties[propertyName].forms[options.formIndex];
					}
				} else {
					if(this._td.properties[propertyName] !== undefined) {
						this._td.properties[propertyName].forms.forEach((form1) => {
							switch(typeof form1.op) {
								case 'string':
									if(form1.op === 'readproperty') {
										 form = form1;
									}
									break;
									
								case 'object':
									let index = form1.op.indexOf('readproperty');
									
									if(index > -1) {
										 form = form1;
									}
									break;
							}
						});
					}
				}
				
				if(form === undefined) {
					reject(new SyntaxError('SyntaxError'));
				} else {
					this.protocolManager.consumeService(this.id, propertyName, 'readproperty', form, undefined, options, 
						(data1) => {
							try {
								let data = parseInteractionResponse(data1, form, interaction);

								resolve(data);
							} catch(error) {
								reject(new SyntaxError('SyntaxError'));
							}
						}, 
						(error) => {
							reject(error);
						}, 
						undefined
					)
					.then(() => {})
					.catch((error) => reject(error));
				}
			}
		});
	}

	// readAllProperties(options) {} // Promise<PropertyMap>

	// readMultipleProperties(propertyNames, options) {} // Promise<PropertyMap>
	
	writeProperty(propertyName, value, options) {
		//console.log('************', this._td, propertyName, value)
		
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let interaction = this._td.properties[propertyName];
				
				let form = undefined;
				
				if(
					(options !== undefined) &&
					(options.formIndex !== undefined)
				){
					if(
						(this._td.properties[propertyName] !== undefined) && 
						(this._td.properties[propertyName].forms[options.formIndex] !== undefined)
					) {
						form = this._td.properties[propertyName].forms[options.formIndex];
					}
				} else {
					if(this._td.properties[propertyName] !== undefined) {
						this._td.properties[propertyName].forms.forEach((form1) => {
							switch(typeof form1.op) {
								case 'string':
									if(form1.op === 'writeproperty') {
										 form = form1;
									}
									break;
									
								case 'object':
									let index = form1.op.indexOf('writeproperty');
									
									if(index > -1) {
										 form = form1;
									}
									break;
							}
						});
					}
				}
				
				if(form === undefined) {
					reject(new SyntaxError('SyntaxError'));
				} else {
					try {
						let data = createInteractionRequest(value, form, interaction);
						
						data.value()
						.then ((value1) => {
							let base = null;
							if(this._td.base !== undefined) {
								base = this._td.base
							}
							this.protocolManager.consumeService(this.id, propertyName, 'writeproperty', form, { [propertyName]: value1 }, options, undefined, undefined, undefined, base)
							.then(() => resolve())
							.catch((error) => reject(error));
						})
						.catch ((error) => reject(error));
						
					} catch(error) {
						reject(error);
					}
				}
			}
		});
	}

	// writeMultipleProperties(valueMap, options) {} // Promise<undefined>

	// writeAllProperties(valueMap, options) {} // Promise<undefined>
			
			
	invokeAction(actionName, params, options) {
		return new Promise((resolve, reject) => {
			let interaction = this._td.actions[actionName];
			
			let form = undefined;
			/*console.log({
				"actionName": actionName,
				"params": params,
				"options": options
			});*/
			if(
				(options !== undefined) &&
				(options.formIndex !== undefined)
			){
				if(
					(this._td.actions[actionName] !== undefined) && 
					(this._td.actions[actionName].forms[options.formIndex] !== undefined)
				) {
					form = this._td.actions[actionName].forms[options.formIndex];
				}
			} else {
				if(this._td.actions[actionName] !== undefined) {
					this._td.actions[actionName].forms.forEach((form1) => {
						switch(typeof form1.op) {
							case 'string':
								if(form1.op === 'invokeaction') {
									 form = form1;
								}
								break;
								
							case 'object':
								let index = form1.op.indexOf('invokeaction');
								
								if(index > -1) {
									 form = form1;
								}
								break;
						}
					});
				}
			}
			
			if(form === undefined) {
				reject(new SyntaxError('SyntaxError'));
			} else {
				try {
					/*console.log({
						"params": params,
						"form": form,
						"interaction": interaction
					})*/
					//let args = createInteractionRequest(params, form, interaction);
 					

					// args.value()
					// .then((value) => {
						this.protocolManager.consumeService(this.id, actionName, 'invokeaction', form, (params || {}), options, undefined, undefined, undefined) // args
						.then((value1) => {
 							//console.log({"value1":value1})						    
							try {
								//problema con mqtt que no devuelve output
								
								let result = parseInteractionResponse(value1, form, interaction.output);
								//console.log({"result": result });
								resolve(result);
							} catch(error) {
								reject(new SyntaxError('SyntaxError'));
							}
						})
						.catch((error) => {
// console.log('2')						    
						    reject(error)
						});
					// })
					// .catch ((error) => reject(error));
				} catch(error) {
					reject(error);
				}
			}
		});
	}
	
	
	observeProperty(propertyName, listener, onerror, options) {
		return new Promise((resolve, reject) => {
			let form = undefined;
			
			if(
				(options !== undefined) &&
				(options.formIndex !== undefined)
			){
				if(
					(this._td.properties[propertyName] !== undefined) && 
					(this._td.properties[propertyName].forms[options.formIndex] !== undefined)
				) {
					form = this._td.properties[propertyName].forms[options.formIndex];
				}
			} else {
				if(this._td.properties[propertyName] !== undefined) {
					this._td.properties[propertyName].forms.forEach((form1) => {
						switch(typeof form1.op) {
							case 'string':
								if(form1.op === 'observeproperty') {
									 form = form1;
								}
								break;
								
							case 'object':
								let index = form1.op.indexOf('observeproperty');
								
								if(index > -1) {
									 form = form1;
								}
								break;
						}
					});
				}
			}
			
			if(form === undefined) {
				reject(new SyntaxError('SyntaxError'));
			} else {
				try {
					let subscription = new Subscription('property', propertyName, this._td.properties[propertyName], form, this.id, this.securityManager, this.protocolManager);
					
					this.protocolManager.consumeService(this.id, propertyName, 'observeproperty', form, undefined, options, 
						(data) => {
// console.log(' + + + observe', data)							
							let reply = new InteractionOutput(data[this._td.properties[propertyName].title], false, form, this._td.properties[propertyName]);
							
							listener(reply);
						}, 
						onerror, 
						undefined
					)
					.then(() => resolve(subscription))
					.catch((error) => {
						// reject(error);
						onerror(error);
					});
					
					// resolve(subscription);
				} catch(error) {
					reject(new SyntaxError('SyntaxError'));
				}
			}
		});
	}

	subscribeEvent(eventName, listener, onerror, options) {
		return new Promise((resolve, reject) => {
			let form = undefined;
			/*console.log({
				"eventName":eventName,
				"listener":listener
			});*/
			if(
				(options !== undefined) &&
				(options.formIndex !== undefined)
			){
				if(
					(this._td.events[eventName] !== undefined) && 
					(this._td.events[eventName].forms[options.formIndex] !== undefined)
				) {
					form = this._td.events[eventName].forms[options.formIndex];
				}
			} else {
				
				if(this._td.events[eventName] !== undefined) {
					this._td.events[eventName].forms.forEach((form1) => {
						
						switch(typeof form1.op) {
							case 'string':
								if(form1.op === 'subscribeevent') {
									 form = form1;
								}
								break;
								
							case 'object':
								let index = form1.op.indexOf('subscribeevent');
								
								if(index > -1) {
									 form = form1;
								}
								break;
						}
					});
				}
			}
			
			if(form === undefined) {
				reject(new SyntaxError('SyntaxError'));
			} else {
				try {
					let subscription = new Subscription('event', eventName, this._td.events[eventName], form, this.id, this.securityManager, this.protocolManager);
					
					this.protocolManager.consumeService(this.id, eventName, 'subscribeevent', form, undefined, options, 
						(data) => {
							//console.log('-------------------------------->>>>>>>>', this._td.events[eventName], data)	
							//console.log('-------------------------------->>>>>>>>', JSON.stringify(data, null, 2))	
                            let reply = undefined;
                            
                            if(data[this._td.events[eventName].data.title] === undefined) {
    							reply = new InteractionOutput(data, false, form, this._td.events[eventName].data);
								//console.log(reply);
                            } else {
    							reply = new InteractionOutput(data[this._td.events[eventName].data.title], false, form, this._td.events[eventName].data);
								//console.log({"else":data[this._td.events[eventName].data.title]});
                            }
							//console.log('reply', reply);
							listener(reply);
						}, 
						onerror, 
						undefined
					)
					.then(() => resolve(subscription))
					.catch((error) => reject(error));
				} catch(error) {
					reject(new SyntaxError('SyntaxError'));
				}
			}
		});
	}
	
	
	getThingDescription() {
		return(this._td);
	}
}
