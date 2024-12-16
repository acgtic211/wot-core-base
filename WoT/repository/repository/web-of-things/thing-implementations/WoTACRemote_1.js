export class WoTACRemote_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            id: config.id
        };
        this.securityManager = securityManager;

        this.datastore.id = this.securityManager.encrypt(this.datastore.id);

        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'temperature': {
                'readHandler': (options) => this.readTemperature(options),
                'writeHandler': (name, value, options) => this.writeTemperature(name, value, options),
                'observeHandler': (options) => this.readTemperature(options)
            },
            'id': {
                'readHandler': (options) => this.readId(options),
                'writeHandler': (name, value, options) => this.writeId(name, value, options),
                'observeHandler': (options) => this.readId(options)
            },
            'increase': {
                'actionHandler': (name, inputs, options) => this.increase(name, inputs, options)
            },
            'decrease': {
                'actionHandler': (name, inputs, options) => this.decrease(name, inputs, options)
            }
        };
    }

    readTemperature(options){
        return new Promise((resolve, reject) => {
            resolve({
                ['temperature']: this.datastore.temperature
            });
        });
    }

    writeTemperature(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.temperature = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('temperature')
                .then(() => {
                    this.emitEvent('temperatureStatus', { ['temperature']: this.datastore.temperature })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    readId(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['id']: this.datastore.id
            });
        });
    }

    writeId(name, value, options) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    increase(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature + 1, options);
    }

    decrease(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature - 1, options);
    }

}