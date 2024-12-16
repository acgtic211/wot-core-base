export class WoTWaterHeater_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            status: config.status
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
            'status': {
                'readHandler': (options) => this.readStatus(options),
                'writeHandler': (name, value, options) => this.writeStatus(name, value, options),
                'observeHandler': (options) => this.readStatus(options)
            },
            'setTemperature': {
                'actionHandler': (name, inputs, options) => this.setTemperature(name, inputs, options)
            },
            'toggle': {
                'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
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

    readStatus(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['status']: this.datastore.status
            });
        });
    }

    writeTemperature(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.temperature = value;
            console.log("Writing temperature with: ", value);
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

    writeStatus(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.status = value;
            console.log("WRITING WH STATUS WITH VALUE: ", value);
            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('status')
                .then(() => {
                    this.emitEvent('acStatus', { ['status']: this.datastore.status })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    setTemperature(name, inputs, options) {
        return this.writeTemperature('temperature', inputs.temperature, options);
    }

    toggle(name, inputs, options) {
        return this.writeStatus(name, inputs.status, options);
    }

}