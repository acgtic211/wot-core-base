export class WoTLedSwitch_v1_0_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            leds: config.leds
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'leds': {
                'readHandler': (options) => this.readLeds(options),
                'writeHandler': (name, value, options) => this.writeLeds(name, value, options),
                'observeHandler': (options) => this.readLeds(options)
            },
            'toggle': {
                'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
            }
        };
    }


    readLeds(options) {
        return new Promise((resolve, reject) => resolve({ ['leds']: this.datastore.leds }));
    }

    writeLeds(name, value, options) {
        return new Promise((resolve, reject) => {
            
            this.datastore.leds = value;
            if(
				(options !== undefined) &&
				(options.data !== undefined) &&
				(options.data.init !== undefined) &&
				(options.data.init === true)
			) {
				resolve();
			} else {

                this.emitPropertyChange('leds')
                .then(() => {
                    this.emitEvent('onChangeLedStatus', value)
                    .then(() => resolve())
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    toggle(name, inputs, options) {
        return this.writeLeds('leds', inputs.leds, options);
    }

}