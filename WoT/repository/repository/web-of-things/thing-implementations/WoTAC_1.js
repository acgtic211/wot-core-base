export class WoTAC_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            alarm: config.alarm,
            allowedID: config.allowedid
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
            },
            'allowedID': {
                'readHandler': (options) => this.readAllowedID(options),
                'writeHandler': (name, value, options) => this.writeAllowedID(name, value, options),
                'observeHandler': (options) => this.readAllowedID(options)
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

    readAlarm(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['alarm']: this.datastore.alarm
            });
        });
    }

    readAllowedID(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['allowedID']: this.datastore.allowedID
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
                        //console.log("EMITED EVENT TEMPERATURESTATUS WITH VALUE: ",this.datastore.temperature);
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

    writeAllowedID(name, value, options) {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    increase(name, inputs, options) {
        var newTemp = this.datastore.temperature + 1;
        return this.writeTemperature('temperature', newTemp, options);
    }

    decrease(name, inputs, options) {
        var newTemp = this.datastore.temperature - 1;
        return this.writeTemperature('temperature', newTemp, options);
    }


}