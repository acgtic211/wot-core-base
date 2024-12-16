export class WoTButton_1 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            message: config.text,
            mailBox: "Nada"
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitPropertyChange = emitPropertyChange;
        this.emitEvent = emitEvent;

        this.handlers = {
            'text': {
                'readHandler': (options) => this.readText(options),
                'writeHandler': (name, value, options) => this.writeText(name, value, options),
                'observeHandler': (options) => this.readText(options)
            },
            'mailBox': {
                'readHandler': (options) => this.readMailBox(options),
                'writeHandler': (name, value, options) => this.writeMailBox(name, value, options),
                'observeHandler': (options) => this.readMailBox(options)
            },
            'sendMessage': {
                'actionHandler': (name, inputs, options) => this.sendMessage(name, inputs, options)
            }
        };
    }

    readText(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['text']: this.datastore.message
            });
        });
    }

    readMailBox(options) {
        return new Promise((resolve, reject) => {
            resolve({
                ['mailBox']: this.datastore.mailBox
            });
        });
    }

    writeText(name, value, options) {
        return new Promise((resolve, reject) => {
           
            console.log("writeText");

            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true) 
            ) {
                resolve();
            } else {
                this.emitPropertyChange('text')
                .then(() => {
                    this.emitEvent('messageReceived', { ['text']: this.datastore.message})
                    .then(() => {
                        resolve();
                    })
                    .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
            }
        });
    }

    writeMailBox(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.mailBox = value;
            if(
                (options !== undefined) &&
                (options.data !== undefined) &&
                (options.data.init !== undefined) &&
                (options.data.init === true) 
            ) {
                resolve();
            } else {
                this.emitPropertyChange('mailBox')
                .then(() => {
                    resolve();
                })
                .catch((error) => reject(error));
            }
        })
    }

    sendMessage(name, inputs, options) {
        return this.writeText(name, inputs, options);
    }
}