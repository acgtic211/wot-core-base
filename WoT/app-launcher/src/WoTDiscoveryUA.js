import { ThingDiscovery } from './ThingDiscovery.js';

export class WoTDiscoveryUA {
	constructor(securityManager) {
		this.securityManager = undefined;

		this.securityManager = securityManager;
	}
	
	discover(filter) {
		if(this.securityManager.validateContext() === false) {
			throw new SecurityError('SecurityError');
		} else {
			let discovery = new ThingDiscovery(filter);
			
			discovery.start();
			
			return(discovery);
		}
	}
}