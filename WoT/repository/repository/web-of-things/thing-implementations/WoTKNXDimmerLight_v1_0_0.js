export class WoTKNXDimmerLight_v1_0_0 {

    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            brightness: config.brightness,
            address: config.address,
            readGroup: config.readGroup,
            writeGroup: config.writeGroup,
            dataType: config.dataType
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
            
            this.protocolManager.knxManager.readService(this.datastore.address, this.datastore.readGroup, this.datastore.dataType)
            .then((data) => {
                this.datastore.brightness = data;
                
                resolve({ ['brightness']: this.datastore.brightness });
            })
            .catch((error) => reject(error));
        });
    }

    writeBrightness(name, value, options) {
        return new Promise((resolve, reject) => {
            this.protocolManager.knxManager.writeService(this.datastore.address, this.datastore.writeGroup, this.datastore.dataType, value.brightness)
            .then((data) => {
                this.datastore.brightness = data;
                console.log('KNX Dimmer Light: ', data);
                this.emitPropertyChange('brightness')
                .then(() => {
                    this.emitEvent('onChangeBrightness', { ['brightness']: data })
                    .then(() => resolve())
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

}
