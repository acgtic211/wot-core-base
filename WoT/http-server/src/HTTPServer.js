'use strict';

import { MQTTClient_v1_0_0 } from './MQTTClient_v1_0_0.js';

import cors from 'cors';
import express from 'express';
import expressRequestId from 'express-request-id';
import spdy from 'spdy';
import fs from 'fs';
import https from 'https';

export class HTTPServer {
	constructor(hostname, port, pathname, pathnameUI, secPort) {
		this.hostname = hostname;
		this.port = port;
		this.pathname = pathname;
		this.pathnameUI = pathnameUI;
		this.secPort = secPort;
		
		this.app = null;

		this.pathnames = {};
		this.schedulers = {};
		this.responses = {};
		this.pathnamesUI = {};
	}
	
	getTypeFromRequest(request) {
		let type = null;
		
		Object.keys(this.pathnames[request.url][request.method.toLowerCase()]).forEach((type2) => {
			if(type === null) {
				if(request.headers.accept === undefined) {
					type = type2;
				} else {
					if(request.headers.accept.indexOf(type2) > -1) {
						type = type2;
					}
				}
			}
		});

		if(type === null) {
			if(request.headers.accept.indexOf('*/*') > -1) {
				type = Object.keys(this.pathnames[request.url][request.method.toLowerCase()])[0];
			}
		}
		
		return(type);
	}
	
	registerPathname(pathname, method, type, scheduler, thingId, id, op) {
		let exists = this.existPathname(pathname, method, type);
		
		if(exists === false) {
			if(this.pathnames[pathname] === undefined) {
				this.pathnames[pathname] = {};
			}
			if(this.pathnames[pathname][method] === undefined) {
				this.pathnames[pathname][method] = {};
			}
			this.pathnames[pathname][method][type] = {
				scheduler: scheduler,
				thingId: thingId,
				id: id,
				op: op
			}
		}
	}
	
	registerScheduler(pathname, method, type, schedulerInfo) {
		let exists = this.existScheduler(pathname, method, type);
		
		if(exists === false) {
			let scheduler = new MQTTClient_v1_0_0();
			
			scheduler.connect(schedulerInfo.hostname, schedulerInfo.port);

			scheduler.setEvent('message', (topic, message, packet) => {
				this.receiveScheduler(topic, JSON.parse(message)) 
				.then(() => {})
				.catch((error) => {});
			});
			
			
			if(this.schedulers[pathname] === undefined) {
				this.schedulers[pathname] = {};
			}
			if(this.schedulers[pathname][method] === undefined) {
				this.schedulers[pathname][method] = {};
			}
			this.schedulers[pathname][method][type] = scheduler;
		}
	}
	
	registerResponse(topic, response, pathname, method, type) {
		return new Promise((resolve, reject) => {
			let exists = this.existResponse(topic);
			
			if(exists === false) {
				this.responses[topic] = response;
			}
			
			this.subscribeScheduler(pathname, method, type, topic)
			.then(() => resolve())
			.catch((error) => reject(error));
		});
	}
	
	registerRoute(method, path, callback) {
		let exists = this.existRoute(method, path);
		
		if(exists === false) {
			this.app[method](path, callback);
		}
	}
	
	existPathname(pathname, method, type) {
		let exists = false;
		
		if(this.pathnames[pathname] !== undefined) {
			if(this.pathnames[pathname][method] !== undefined) {
				if(this.pathnames[pathname][method][type] !== undefined) {
					exists = true;
				}
			}
		}
		
		return(exists);
	}
	
	existScheduler(pathname, method, type) {
		let exists = false;
		
		if(this.schedulers[pathname] !== undefined) {
			if(this.schedulers[pathname][method] !== undefined) {
				if(this.schedulers[pathname][method][type] !== undefined) {
					exists = true;
				}
			}
		}
		
		return(exists);
	}
	
	existResponse(topic) {
		let exists = false;
		
		if(this.responses[topic] !== undefined) {
			exists = true;
		}
		
		return(exists);
	}
	
	existRoute(method, path) {
		let exists = false;
		
		// if(this.pathnames[path] !== undefined) {
			// if(this.pathnames[path][method] !== undefined) {
				// exists = true;
			// }
		// }
		
		return(exists);
	}
	
	getPathname(pathname, method, type) {
		let pathname1 = null;
		
		if(this.existPathname(pathname, method, type) === true) {
			pathname1 = this.pathnames[pathname][method][type];
		}
		
		return(pathname1);
	}
	
	getScheduler(pathname, method, type) {
		let scheduler = null;
		
		if(this.existScheduler(pathname, method, type) === true) {
			scheduler = this.schedulers[pathname][method][type];
		}
		
		return(scheduler);
	}
	
	getResponse(topic) {
		let response = null;
		
		if(this.existResponse(topic) === true) {
			response = this.responses[topic];
		}
		
		return(response);
	}
	
	unregisterPathname(pathname, method, type) {
		let exists = this.existPathname(pathname, method, type);
		
		if(exists === true) {
			delete this.pathnames[pathname][method][type];
			if(Object.keys(this.pathnames[pathname][method]).length === 0) {
				delete this.pathnames[pathname][method];
			}
			if(Object.keys(this.pathnames[pathname]).length === 0) {
				delete this.pathnames[pathname];
			}
		}
	}
	
	unregisterScheduler(pathname, method, type) {
		let exists = this.existScheduler(pathname, method, type);

		if(exists === true) {
			let scheduler = this.getScheduler(pathname, method, type);
			scheduler.disconnect(pathname)
			.then(() => {})
			.catch((error) => {})
			.finally(() => {
				console.log({
					"pathname": pathname,
					"method": method,
					"type": type
				});
				delete this.schedulers[pathname][method][type];
				if(Object.keys(this.schedulers[pathname][method]).length === 0) {
					delete this.schedulers[pathname][method];
				}
				if(Object.keys(this.schedulers[pathname]).length === 0) {
					delete this.schedulers[pathname];
				}
			});
		}
	}
	
	unregisterResponse(pathname, method, type, topic) {
		return new Promise((resolve, reject) => {
			this.unsubscribeScheduler(pathname, method, type, topic)
			.then(() => {})
			.catch((error) => {
				reject(error)
			})
			.finally(() => {
				let exists = this.existResponse(topic);
				
				if(exists === true) {
					delete this.responses[topic];
				}
				
				resolve();
			});
		});
	}

	sendRequestToScheduler(request, response) {
		let type = this.getTypeFromRequest(request);
		
		if(type !== null) {
			if(this.existPathname(request.url, request.method.toLowerCase(), type) === true) {
				let pathname = this.getPathname(request.url, request.method.toLowerCase(), type);
				let message = JSON.stringify({
					thingId: pathname.thingId,
					id: pathname.id,
					op: pathname.op,
					pathname: request.url,
					method: request.method.toLowerCase(),
					type: type,
					params: request.body
				});
				let responseTopic = pathname.scheduler.topic + '/' + request.id;
// console.log(message)		
// console.log(responseTopic, response, request.url, request.method.toLowerCase(), type, pathname.scheduler.topic, message)		
// console.log(responseTopic, request.url, request.method.toLowerCase(), type, pathname.scheduler.topic, message)		

				this.publishScheduler(responseTopic, response, request.url, request.method.toLowerCase(), type, pathname.scheduler.topic, message)
				.then(() => {})
				.catch((error) => {
					response.status(404);
					response.send();
				});
			} else {
				response.status(404);
				response.send();
			}
		} else {
			response.status(404);
			response.send();
		}
	}

	sendResponseFromScheduler(topic, message) {
// console.log(message)					
		
		if(this.existResponse(topic) === true) {
			let response = this.getResponse(topic);

			response.status(message.status);
			response.type(message.type);
			response.send(message.content);
		}
	}

	subscribeScheduler(pathname, method, type, topic) {
		return new Promise((resolve, reject) => {
			let scheduler = this.getScheduler(pathname, method, type);

			scheduler.subscribe(topic)
			.then(() => resolve())
			.catch((error) => reject(error));
		});
	}

	publishScheduler(responseTopic, response, pathname, method, type, topic, message) {
		return new Promise((resolve, reject) => {
			this.registerResponse(responseTopic, response, pathname, method, type)
			.then(() => {
				let scheduler = this.getScheduler(pathname, method, type);
			
				scheduler.publish(topic, message, responseTopic);
				
				resolve();
			})
			.catch((error) => reject(error));
		});
	}

	receiveScheduler(topic, message) {
		return new Promise((resolve, reject) => {
			this.sendResponseFromScheduler(topic, message);
					
			this.unregisterResponse(message.pathname, message.method, message.type, topic)
			.then(() => resolve())
			.catch((error) => reject(error));
		});
	}

	unsubscribeScheduler(pathname, method, type, topic) {
		return new Promise((resolve, reject) => {
			let scheduler = this.getScheduler(pathname, method, type);
			
			scheduler.unsubscribe(topic)
			.then(() => resolve())
			.catch((error) => reject(error));
		});
	}
	
	init() {
		this.app = express();

		this.app.use(cors());
		this.app.use(expressRequestId());
		this.app.use(express.json());

		this.app.use((request, response, next) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			if((request.url === this.pathname) || (request.url === this.pathnameUI)) {
				next();
			} else {
				if((this.pathnames[request.url] !== undefined) || (this.pathnamesUI[request.url] !== undefined)) {
					next();
				} else {
					response.status(404);
					response.end();
				}
			}
		});

		this.app.get('/favicon.ico', ((request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			response.status(204);
			response.end();
		}));

		this.app.get(this.pathname, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			response.status(200);
			response.type('application/json');
			response.send(this.pathnames);
		});

		this.app.post(this.pathname, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			this.registerPathname(request.body.pathname, request.body.method, request.body.type, request.body.scheduler, request.body.thingId, request.body.id, request.body.op);
			this.registerScheduler(request.body.pathname, request.body.method, request.body.type, request.body.scheduler);
				
			this.registerRoute(request.body.method, request.body.pathname, (request, response) => {
				this.sendRequestToScheduler(request, response);
			});

			response.status(200);
			response.type('application/json');
			response.send({ url: request.body.pathname });
		});

		this.app.delete(this.pathname, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			this.unregisterScheduler(request.body.pathname, request.body.method, request.body.type);
			this.unregisterPathname(request.body.pathname, request.body.method, request.body.type);
			
			response.status(200);
			response.type('application/json');
			response.send({ url: request.body.pathname });
		});

		this.app.get(this.pathnameUI, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			response.status(200);
			response.type('application/json');
			response.send(this.pathnamesUI);
		});

		this.app.post(this.pathnameUI, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// console.log(request.body)		    
			this.registerPathnameUI(request.body.pathname, request.body.method, request.body.type, request.body.res);

			this.registerRouteUI(request.body.method, request.body.pathname, (request2, response2) => {
    			response2.status(200);
    			response2.type(request.body.type);
    			response2.send(request.body.res);
			});

			response.status(200);
			response.type('application/json');
			response.send({ url: request.body.pathname });
		});

		this.app.delete(this.pathnameUI, (request, response) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			this.unregisterPathnameUI(request.body.pathname, request.body.method, request.body.type);
			
			response.status(200);
			response.type('application/json');
			response.send({ url: request.body.pathname });
		});
	}
	
	registerPathnameUI(pathname, method, type, res) {
		let exists = this.existPathnameUI(pathname, method, type);
		
		if(exists === false) {
			if(this.pathnamesUI[pathname] === undefined) {
				this.pathnamesUI[pathname] = {};
			}
			if(this.pathnamesUI[pathname][method] === undefined) {
				this.pathnamesUI[pathname][method] = {};
			}
			this.pathnamesUI[pathname][method][type] = {
				res: res
			}
		}
	}
	
	existPathnameUI(pathname, method, type) {
		let exists = false;
		
		if(this.pathnamesUI[pathname] !== undefined) {
			if(this.pathnamesUI[pathname][method] !== undefined) {
				if(this.pathnamesUI[pathname][method][type] !== undefined) {
					exists = true;
				}
			}
		}
		
		return(exists);
	}
	
	registerRouteUI(method, path, callback) {
		let exists = this.existRoute(method, path);
		
		if(exists === false) {
			console.log('registerRouteUI', method, path)	    
			this.app[method](path, callback);
		}
	}
	
	unregisterPathnameUI(pathname, method, type) {
		let exists = this.existPathnameUI(pathname, method, type);
		
		if(exists === true) {
			delete this.pathnamesUI[pathname][method][type];
			if(Object.keys(this.pathnamesUI[pathname][method]).length === 0) {
				delete this.pathnamesUI[pathname][method];
			}
			if(Object.keys(this.pathnamesUI[pathname]).length === 0) {
				delete this.pathnamesUI[pathname];
			}
		}
	}


	
	
	start() {
		// this.app.listen(this.port, this.hostname);
		this.app.listen(this.port);

		/*spdy.createServer(
			{
				key: fs.readFileSync('/usr/src/http-server/keys9/acg.ual.es_privatekey.pem'),
				cert: fs.readFileSync('/usr/src/http-server/keys9/acg.ual.es.pem')
			},
			this.app
		).listen(this.secPort, (err) => {
			if(err){
				throw new Error(err)
			}
			console.log("Listening on port ", this.secPort);
		});*/
		
		console.log('HTTP Server started...');
	}
	
	
	stop() {
		console.log('HTTP Server stopped...');
	}
}
