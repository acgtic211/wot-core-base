export class WoTAC_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            alarm: config.alarm
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
            'alarm': {
                'readHandler': (options) => this.readAlarm(options),
                'writeHandler': (name, value, options) => this.writeAlarm(name, value, options),
                'observeHandler': (options) => this.readAlarm(options)
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

    readAlarm(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['alarm']: this.datastore.alarm
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

    writeAlarm(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.alarm = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('alarm')
                .then(() => {
                    this.emitEvent('alarmStatus', { ['alarm']: this.datastore.alarm })
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
        var newTemp = this.datastore.temperature + 1;
        return this.writeTemperature('temperature', newTemp, options);
    }

    decrease(name, inputs, options) {
        var newTemp = this.datastore.temperature - 1;
        return this.writeTemperature('temperature', newTemp, options);
    }

    toggleAlarm(name, inputs, options) {
        return this.writeAlarm('alarm', !this.datastore.alarm, options);
    }

}