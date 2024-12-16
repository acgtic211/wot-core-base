export class WoTACAlarm_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            temperature: config.temperature,
            alarmStatus: config.alarmStatus
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
            'alarmStatus': {
                'readHandler': (options) => this.readAlarmStatus(options),
                'writeHandler': (name, value, options) => this.writeAlarmStatus(name, value, options),
                'observeHandler': (options) => this.readAlarmStatus(options)
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

    readAlarmStatus(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['alarmStatus']: this.datastore.alarmStatus
            });
        });
    }

    writeTemperature(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.temperature = value;

            if(this.datastore.temperature > 25 && this.datastore.alarmStatus !== true) {
                this.writeAlarmStatus('', true, options);
            } else if(this.datastore.temperature <= 25 && this.datastore.alarmStatus !== false) {
                this.writeAlarmStatus('', false, options);
            }

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

    writeAlarmStatus(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.alarmStatus = value;

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true)
            ) {
                resolve();
            } else {
                this.emitPropertyChange('alarmStatus')
                .then(() => {
                    this.emitEvent('alarmStatus', { ['alarmStatus']: this.datastore.alarmStatus })
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }
}