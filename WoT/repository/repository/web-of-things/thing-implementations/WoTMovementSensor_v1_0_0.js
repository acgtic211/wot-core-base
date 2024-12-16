export class WoTMovementSensor_v1_0_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.securityManager = securityManager;
        this.protocolManager = protocolManager;
        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'triggerMovement': {
                'actionHandler': (name, inputs, options) => this.triggerMovement(name, inputs, options)
            }
        };
    }

    triggerMovement(name, inputs, options) {
        return new Promise((resolve, reject) => {
            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitEvent('movement', { ['movement']: "Movement detected!" })
                .then(() => resolve())
                .catch((error) => reject(error))
            }
        })
    }
}