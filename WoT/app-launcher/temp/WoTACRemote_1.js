export class WoTACRemote_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            ACStatus: config.ACStatus
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'temperature': {
                'readHandler': (options) => this.readTemperature(options),
                'writeHandler': (name, value, options) => this.writeTemperature(name, value, options),
                'observeHandler': (options) => this.readTemperature(options)
            },
            'ACStatus': {
                'readHandler': (options) => this.readACStatus(options),
                'writeHandler': (name, value, options) => this.writeACStatus(name, value, options),
                'observeHandler': (options) => this.readACStatus(options)
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

    readACStatus(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['ACStatus']: this.datastore.ACStatus
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

    writeACStatus(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.ACStatus = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('ACStatus')
                .then(() => {
                    this.emitEvent('ACStatus', { ['ACStatus']: this.datastore.ACStatus })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    increase(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature + 1, options);
    }

    decrease(name, inputs, options) {
        return this.writeTemperature('temperature', this.datastore.temperature - 1, options);
    }

    toggleAC(name, inputs, options) {
        return this.writeACStatus('ACStatus', !this.datastore.ACStatus, options);
    }

    readTemp(name, inputs, options) {
        return this.readTemperature(options);
    }

}