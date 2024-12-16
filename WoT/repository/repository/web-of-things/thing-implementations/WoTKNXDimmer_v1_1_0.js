export class WoTKNXDimmer_v1_1_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            bri: config.bri,
        }

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'bri': {
                'readHandler': (options) => this.readBrightness(options),
                'writeHandler': (name, value, options) => this.writeBrightness(name, value, options),
                'observeHandler': (options) => this.readBrightness(options)
            },
            'slide': {
                'actionHandler': (name, inputs, options) => this.slide(name, inputs, options)
            }
        };

        
    }

    readBrightness(options) {
        return new Promise((resolve, reject) => {
            resolve({ ['brightness']: this.datastore.bri })
        });
    }

    writeBrightness(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.bri = value
            
            this.emitPropertyChange('bri')
            .then(() => {
                this.emitEvent('onChangeBrightness', this.datastore.bri)
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

    slide(name, inputs, options) {
        return this.writeBrightness('brightness', inputs, options);
    }

}