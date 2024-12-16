import URL from 'url';

import { HTTPManager } from './HTTPManager.js';
import { HTTPSManager } from './HTTPSManager.js';
import { MQTTManager } from './MQTTManager.js';
import { KNXManager } from './KNXManager.js';
import { WSManager } from './WSManager.js';
import { MQTTSManager } from './MQTTSManager.js';
export class ProtocolManager {
	constructor(config) {
		this.config = config;
		this.httpManager = new HTTPManager(this.config.httpManager);
		this.httpsManager = new HTTPSManager(this.config.httpsManager);
		this.mqttManager = new MQTTManager(this.config.mqttManager);
		this.knxManager = new KNXManager(this.config.knxManager);
		this.wsManager = new WSManager(this.config.wsManager);
		this.mqttsManager = new MQTTSManager(this.config.mqttsManager);
	}

	

	getHTTPMethodName(op) {
		let methodName = undefined;

		switch(op) {
			case 'readproperty':				methodName = 'GET';		break;
			case 'writeproperty':				methodName = 'POST';		break;
			case 'invokeaction':				methodName = 'POST';	break;
			case 'readallproperties':			methodName = 'GET';		break;
			case 'writeallproperties':			methodName = 'PUT';		break;
			case 'readmultipleproperties':		methodName = 'GET';		break;
			case 'writemultipleproperties':		methodName = 'PUT';		break;
		}
		
		return(methodName);
	}

	getCoAPMethodName(op) {
		let methodName = undefined;

		switch(op) {
			case 'readproperty':				methodName = 'GET';		break;
			case 'writeproperty':				methodName = 'PUT';		break;
			case 'observeproperty':				methodName = 'GET';		break;
			case 'unobserveproperty':			methodName = 'GET';		break;
			case 'invokeaction':				methodName = 'POST';	break;
			case 'subscribeevent':				methodName = 'GET';		break;
			case 'unsubscribeevent':			methodName = 'GET';		break;
			case 'readallproperties':			methodName = 'GET';		break;
			case 'writeallproperties':			methodName = 'PUT';		break;
			case 'readmultipleproperties':		methodName = 'GET';		break;
			case 'writemultipleproperties':		methodName = 'PUT';		break;
		}
		
		return(methodName);
	}

	getMQTTControlPacketValue(op) {
		let controlPacketValue = undefined;
		
		switch(op) {
			case 'readproperty':				controlPacketValue = 'SUBSCRIBE';		break;
			case 'writeproperty':				controlPacketValue = 'PUBLISH';			break;
			case 'observeproperty':				controlPacketValue = 'SUBSCRIBE';		break;
			case 'unobserveproperty':			controlPacketValue = 'UNSUBSCRIBE';		break;
			case 'invokeaction':				controlPacketValue = 'PUBLISH';			break;
			case 'subscribeevent':				controlPacketValue = 'SUBSCRIBE';		break;
			case 'unsubscribeevent':			controlPacketValue = 'UNSUBSCRIBE';		break;
			case 'readallproperties':			controlPacketValue = 'SUBSCRIBE';		break;
			case 'writeallproperties':			controlPacketValue = 'PUBLISH';			break;
			case 'readmultipleproperties':		controlPacketValue = 'SUBSCRIBE';		break;
			case 'writemultipleproperties':		controlPacketValue = 'PUBLISH';			break;
		}
		
		return(controlPacketValue);
	}	

	getCoAPSubprotocol(op) {
		let subprotocol = undefined;

		switch(op) {
			case 'observeproperty':				subprotocol = 'cov:observe';		break;
			case 'unobserveproperty':			subprotocol = 'cov:observe';		break;
			case 'subscribeevent':				subprotocol = 'cov:observe';		break;
			case 'unsubscribeevent':			subprotocol = 'cov:observe';		break;
		}
		
		return(subprotocol);
	}

	getRequest(thingId, name, op, form, data, options, callbackOk, callbackError, td, base) {
		
		let url;

		if(base !== null && base !== undefined) {
			let h = form.href.substring(1)
			let u = base + h;
			url = URL.parse(u);
		} else {
			url = URL.parse(form.href);
		}

		
		
		let href = form.href;
		
		let protocol = url.protocol.substring(0, url.protocol.length-1).toUpperCase();
		let hostname = url.hostname;
		let port = (url.port === null) ? 80 : url.port;
		let pathname = url.pathname;
		
		switch(protocol) {
			case 'HTTP':	
			case 'COAP':	
			    pathname = url.pathname;
			    break;

			case 'MQTT':	
                pathname = url.pathname.substring(1, url.pathname.length);
                if(href.charAt(href.length-1) === '#') {
                    pathname = pathname + '#';
                }
			    break;

			case 'MQTTS':
				pathname = url.pathname.substring(1, url.pathname.length);
				if(href.charAt(href.length-1) === '#') {
                    pathname = pathname + '#';
                }
			    break;
		}
// console.log(form.href, pathname)

		let method = undefined;
		if(form['htv:methodName'] !== undefined) {
			method = form['htv:methodName'];
		} else {
			if(form['cov:methodName'] !== undefined) {
				method = form['cov:methodName'];
			} else {
				if(form['mqv:controlPacketValue'] !== undefined) {
					method = form['mqv:controlPacketValue'];
				} else {
					switch(protocol) {
						case 'HTTP':	method = this.getHTTPMethodName(op);			break;
						case 'HTTPS': 	method = this.getHTTPMethodName(op);			break;
						case 'COAP':	method = this.getCoAPMethodName(op);			break;
						case 'MQTT':	method = this.getMQTTControlPacketValue(op);	break;
						case 'MQTTS':	method = this.getMQTTControlPacketValue(op);	break;
					}
				}
			}
		}
		
		let subprotocol = undefined;
		switch(protocol) {
			case 'COAP':	method = this.getCoAPSubprotocol(op);		break;
		}

		let type = form.contentType;

		let request = {
			thingId: thingId, 
			name: name, 
			op: op, 
			formOp: form.op,
			href: href,
			protocol: protocol,
			hostname: hostname,
			port: port,
			pathname: pathname,
			method: method,
			subprotocol: subprotocol,
			type: type,
			data: data, 
			options: options, 
			callbackOk: callbackOk, 
			callbackError: callbackError, 
			td: td
		};

		return(request);
	}
	
	
	
	startService(thingId, name, op, form, data, options, callbackOk, callbackError, td) {
		return new Promise((resolve, reject) => {
			let request = this.getRequest(thingId, name, op, form, data, options, callbackOk, callbackError, td);
			
			
			switch(request.protocol) {
				case 'MQTT':
					this.mqttManager.initializeService(request)
					.then(() => {
						this.mqttManager.startService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;
						
				case 'HTTP':
					
					this.httpManager.initializeService(request)
					.then(() => {
						this.httpManager.startService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'HTTPS':
					this.httpsManager.initializeService(request)
					.then(() => {
						
						this.httpsManager.startService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'MQTTS':
					this.mqttsManager.initializeService(request)
						.then(() => {
							this.mqttsManager.startService(request)
							.then(() => resolve())
							.catch((error) => reject(error));
						});
					break;
			}
		});
	}
	
	exposeService(thingId, name, op, form, data, options) {
		return new Promise((resolve, reject) => {
		
			//console.log(thingId, name, op, form, data, options);
			let request = this.getRequest(thingId, name, op, form, data, options, undefined, undefined, undefined);
			//console.log({ "requestExposeService": request });
			switch(request.protocol) {
				case 'MQTT':
					//console.log(request);
					this.mqttManager.initializeService(request)
					.then(() => {
						this.mqttManager.exposeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;
						
				case 'HTTP':
					this.httpManager.initializeService(request)
					.then(() => {
						
						this.httpManager.exposeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'HTTPS':
					this.httpsManager.initializeService(request)
					.then(() => {
						
						this.httpsManager.exposeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'MQTTS':
					this.mqttsManager.initializeService(request)
					.then(() => {
						this.mqttsManager.exposeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;
			}
		});
	}
	
	consumeService(thingId, name, op, form, data, options, callbackOk, callbackError, td, base) {
		return new Promise((resolve, reject) => {
			if(base !== null && base !== undefined) {
				data = data[name];
			}
			let request = this.getRequest(thingId, name, op, form, data, options, callbackOk, callbackError, td, base);
			switch(request.protocol) {
				case 'MQTT':
					this.mqttManager.initializeService(request)
					.then(() => {
						this.mqttManager.consumeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;
						
				case 'HTTP':
					this.httpManager.initializeService(request)
					.then(() => {
						this.httpManager.consumeService(request)
						.then((response) => resolve(response))
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'MQTTS':
					this.mqttsManager.initializeService(request)
					.then(() => {
						this.mqttsManager.consumeService(request)
						.then(() => resolve())
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;

				case 'HTTPS':
					this.httpsManager.initializeService(request)
					.then(() => {
						this.httpsManager.consumeService(request)
						.then((response) => resolve(response))
						.catch((error) => reject(error));
					})
					.catch((error) => reject(error));
					break;
			}
		});
	}


	
	stopAllServices(thingId) {
		return new Promise((resolve, reject) => {
			const promises = [];
			
			promises.push(this.mqttManager.processUnregisterThing(thingId));
			promises.push(this.httpManager.processUnregisterThing(thingId));
			promises.push(this.mqttsManager.processUnregisterThing(thingId));
			promises.push(this.httpsManager.processUnregisterThing(thingId));

						
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

	

	finalizeAllServices() {
		return new Promise((resolve, reject) => {
			const promises = [];

			promises.push(this.mqttManager.processUnregisterAll());
			promises.push(this.mqttsManager.processUnregisterAll());
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
}