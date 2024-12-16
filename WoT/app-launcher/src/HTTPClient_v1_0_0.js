'use strict';

import AbortController from 'abort-controller';
import fetch from 'node-fetch';

export class HTTPClient_v1_0_0 {
	constructor() {
		
	}
	
	register(scheduler, hostname, port, pathname, method, type, thingId, id, op) {
		return new Promise((resolve, reject) => {
			//console.log(scheduler, hostname, port, pathname, method, type, thingId, id, op);
			const content = {
				scheduler: scheduler,
				pathname: pathname,
				method: method.toLowerCase(),
				type: type,
				thingId: thingId,
				id: id,
				op: op
			};
			
			this.fetch(hostname, port, '/api/paths', 'post', 'application/json', content)
			.then((json) => resolve())
			.catch((error) => reject(error));
		});
	}
	
	unregister(hostname, port, pathname, method, type) {
		return new Promise((resolve, reject) => {
			const content = {
				pathname: pathname,
				method: method.toLowerCase(),
				type: type
			};
				
			this.fetch(hostname, port, '/api/paths', 'delete', 'application/json', content)
			.then((json) => resolve())
			.catch((error) => reject(error));
		});
	}
	
	fetchURL(href, method, contentType, message) {
		try {
			let url = new URL(href);

			if((url !== undefined) && (url !== null)) {
				let host = url.hostname;
				let port = (url.port === null) ? 80 : url.port;
				let pathname = url.pathname;
				let search = url.search;

				if(search !== '') {
					pathname += search;
				}
				
				return this.fetch(host, port, pathname, method, contentType, message);
			} else {
				return Promise.reject(new Error('HTTPClient_v1_0_0.fetchURL', 'Invalid URL...'));
			}
		} catch(error) {
			return Promise.reject(new Error('HTTPClient_v1_0_0.fetchURL', 'URL not specified...'));
		}
	}
	
	fetch(host, port, pathname, method, contentType, message) {
		return new Promise((resolve, reject) => {
			let controller = new AbortController();
			let url;
			//console.log(host);
			if(host === "wot-lab.com" || host === "acg.ual.es")
				url = 'https://' + host + pathname;
			else 
				url = 'http://' + host + ':' + port + pathname;
			let settings = null;
			
			if(message === null) {
				settings = {
					signal: controller.signal,
					method: method,
					headers: {
						'Accept': contentType,
						'Content-Type': contentType,
						
					}
				};
				
				//console.log(settings);
			} else {
			    let body = undefined;
			    
				switch(contentType) {
					case 'application/json':
					    body = JSON.stringify(message);
						break;
					case 'text/html':
					case 'text/plain':
					    body = message;
						break;
					default:
					    body = JSON.stringify(message);
						break;
				}
				settings = {
					signal: controller.signal,
					method: method,
					headers: {
						'Accept': contentType,
						'Content-Type': contentType,
						
					},
					body: body
				};
			}
			
			setTimeout(() => controller.abort(), 5000);
			//console.log(url);	
			
			if (url === "http://acg.ual.es:80/api/paths" || url === "https://wot-lab.com/api/paths") url = "http://http-server:38090/api/paths";
			
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
			//console.log(url);
			//"https://acgsaas.ual.es/wot-core/api/paths"
			fetch(url, settings)
			.then(response => {
				//console.log(url);
				//console.log('res: ', response);

				if (response.status == 502) {
					// Connection timeout
					reject(new Error('HTTPClient_v1_0_0.fetch', 'Connection timeout...'));
				} else {
					if (response.status != 200) {
						console.log({ "Response to HTTPClient": response });						
						reject(new Error('HTTPClient_v1_0_0.fetch', 'Error fetching URL...'));
					} else {
						
						switch(contentType) {
							case 'application/json':
								response.text()
								.then((text) => {
								    if(text === '') {
													
    								    resolve();
								    } else {
    								    try {
    								        let json = JSON.parse(text);
														
        								    resolve(json);
    								    } catch(error) {
											reject(new Error('HTTPClient_v1_0_0.fetch', error));
    								    }
								    }
						        })
								.catch((error) => {
								    reject(new Error('HTTPClient_v1_0_0.fetch', error));
								});
								break;
							case 'text/html':
							case 'text/plain':
								response.text()
								.then((text) => {
									//console.log('text', text);						
								    resolve(text);
								})
								.catch((error) => reject(new Error('HTTPClient_v1_0_0.fetch', error)));
								break;
							default:
								
								resolve(response);
								break;
						}
					}
				}
			})
			.catch((error) => reject(new Error('HTTPClient_v1_0_0.fetch', error)));
		});
	}
	
	
	
	register2(hostname, port, pathname, method, type, res) {
		return new Promise((resolve, reject) => {
			const content = {
				pathname: pathname,
				method: method.toLowerCase(),
				type: type,
				res: res
			};

			this.fetch(hostname, port, '/api/ui', 'post', 'application/json', content)
			.then((json) => resolve())
			.catch((error) => reject(error));
		});
	}
	
	unregister2(hostname, port, pathname, method, type) {
		return new Promise((resolve, reject) => {
			const content = {
				pathname: pathname,
				method: method.toLowerCase(),
				type: type
			};
				
			this.fetch(hostname, port, '/api/ui', 'delete', 'application/json', content)
			.then((json) => resolve())
			.catch((error) => reject(error));
		});
	}
}



class Error {
	constructor(source, message, stack) {
		this.source = source;
		this.message = message;
		
		if(source === undefined) {
			if(message === undefined) {
				this.stack = stack;
			} else {
				if(stack === undefined) {
					this.stack = message;
				} else {
					this.stack = message + '\n' + '  at ' + stack;
				}
			}
		} else {
			if(message === undefined) {
				if(stack === undefined) {
					this.stack = source + ':';
				} else {
					this.stack = source + ':\n' + '  at ' + stack;
				}
			} else {
				if(stack === undefined) {
					this.stack = source + ': ' + message;
				} else {
					this.stack = source + ': ' + message + '\n' + '  at ' + stack;
				}
			}
		}
	}
}