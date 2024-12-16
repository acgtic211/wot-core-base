export class WoTKNXDimmerLight_v1_1_0 {

    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            brightness: config.brightness
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'brightness': {
                'readHandler': (options) => this.readBrightness(options),
                'writeHandler': (name, value, options) => this.writeBrightness(name, value, options),
                'observeHandler': (options) => this.readBrightness(options)
            }
        };
    }


    readBrightness(options) {
        return new Promise((resolve, reject) => {
            resolve({ ['brightness']: this.datastore.brightness });
        });
    }

    writeBrightness(name, value, options) {
        return new Promise((resolve, reject) => {
            
            this.datastore.brightness = value;
            console.log('KNX Dimmer Light: ', value);
            this.emitPropertyChange('brightness')
            .then(() => {
                this.emitEvent('onChangeBrightness', { ['brightness']: value })
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

}