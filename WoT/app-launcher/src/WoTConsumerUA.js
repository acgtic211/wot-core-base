import { ConsumedThing } from './ConsumedThing.js';

export class WoTConsumerUA {
	constructor(securityManager, protocolManager) {
		this.securityManager = undefined;
		this.protocolManager = undefined;
		
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
	}
	
	consume(td, id) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'))
			} else {
				// validate the TD
				// if that fails
				// throw new SyntaxError('SyntaxError');
				
				// expand the TD
				// if that fails
				// throw new Error('ExpandError');

				let thing = new ConsumedThing(td, id, this.securityManager, this.protocolManager);
				
				// Set up the WoT Interactions
				
				resolve(thing);
			}
		});
	}
}