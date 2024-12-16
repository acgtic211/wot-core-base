import { ExposedThing } from './ExposedThing.js';

export class WoTProducerUA {
	constructor(securityManager, protocolManager) {
		this.securityManager = undefined;
		this.protocolManager = undefined;
		
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
	}
	
	produce(td, id) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'))
			} else {
				// expand the TD
				// if that fails
				// throw new Error('ExpandError');
				
				let thing = new ExposedThing(td, id, this.securityManager, this.protocolManager);
				
				resolve(thing);
			}
		});
	}
}