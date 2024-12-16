export class WoTKNXDimmer_v1_1_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            brightness: config.brightness,
        }

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'brightness': {
                'readHandler': (options) => this.readBrightness(options),
                'writeHandler': (name, value, options) => this.writeBrightness(name, value, options),
                'observeHandler': (options) => this.readBrightness(options)
            },
            'slide': {
                'actionHandler': (name, inputs, options) => this.slide(name, inputs, options)
            },
            'physicalBrightness': {
                'readHandler': (options) => this.readPhysicalBrightness(options),
                'writeHandler': (name, value, options) => this.writePhysicalBrightness(name, value, options),
                'observeHandler': (options) => this.readPhysicalBrightness(options)
            },
            'slidePhysicalDevice': {
                'actionHandler': (name, inputs, options) => this.slidePhysicalDevice(name, inputs, options)
            }
        };

        
    }

    readBrightness(options) {
        return new Promise((resolve, reject) => {
            resolve({ ['brightness']: this.datastore.brightness })
        });
    }

    writeBrightness(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.brightness = value
            console.log('KNXDimmer value: ', value);
            this.emitPropertyChange('brightness')
            .then(() => {
                
                this.emitEvent('onChangeBrightness', this.datastore.brightness)
                .then(() => resolve(console.log('EVENTO EMITIDO CON', this.datastore.brightness)))
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

    slide(name, inputs, options) {
        return this.writeBrightness('brightness', inputs.brightness, options);
    }

    readPhysicalBrightness(options) {

    }

    writePhysicalBrightness(name, value, options) {

    }

    slidePhysicalDevice(name, inputs, options) {

    }

}