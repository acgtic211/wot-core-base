export class WoTKNXButton_v1_0_0 {

    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            address: "192.168.1.38",
            readGroup: "",
            writeGroup: "",
            dataType: ""
        };

        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'press': {
                'actionHandler': (name, inputs, options) => this.press(name, inputs, options)
            }
        };
    }

    press(name, inputs, options) {
        return new Promise((resolve, reject) => {
            this.protocolManager.knxManager.writeService(this.datastore.address, this.datastore.writeGroup, this.datastore.dataType, inputs)
            .then((data) => {
                this.emitEvent('pressed')
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

}