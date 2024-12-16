export class WoTServoFlag_v1_0_0 {
	constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
	    
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
		
		this.emitPropertyChange = emitPropertyChange;
		this.emitEvent = emitEvent;
		
		this.handlers = {
			
		};
	}

	move(name, inputs, options){
        
    }
	
}