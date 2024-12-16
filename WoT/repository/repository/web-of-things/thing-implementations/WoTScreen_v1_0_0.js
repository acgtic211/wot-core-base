export class WoTScreen_v1_0_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            text: config.text
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'text': {
                'readHandler': (options) => this.readText(options),
                'writeHandler': (name, value, options) => this.writeText(name, value, options),
                'observeHandler': (options) => this.readText(options)
            }
        };
    }

    readText(options) {
        return new Promise((resolve, reject) => resolve({ ['text']: this.datastore.text }));
    }

    writeText(name, value, options) {
        return new Promise((resolve, reject) => {
            this.datastore.text = value.text.text;
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
                    this.emitEvent('onChangeText', { ['text']: this.datastore.text })
                    .then(() => resolve())
                    .catch((error) => reject(error))
                })
                .catch((error) => reject(error));
            }
        });
    }
}