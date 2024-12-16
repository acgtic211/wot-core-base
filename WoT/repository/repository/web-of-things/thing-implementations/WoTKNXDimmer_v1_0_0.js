import WoTnectivity from 'wotnectivity-knx';
var eventData = 0;
export class WoTKNXDimmer_v1_0_0 {
    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
        this.datastore = {
            brightness: config.brightness,
            address: config.address,
            readGroup: config.readGroup,
            writeGroup: config.writeGroup,
            dataType: config.dataType,
            pathname: config.pathname,
            target: config.target
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
            }
        };

        sub(this.protocolManager.wsManager, this.datastore.readGroup, this.datastore.dataType, this.datastore.pathname, this.datastore.target);
    }

    readBrightness(options) {
        return new Promise((resolve, reject) => {
            resolve({ ['brightness']: eventData })
        });
    }

    writeBrightness(name, value, options) {
        return new Promise((resolve, reject) => {
            eventData = value;
            console.log('KNXDimmer value: ', value);
            this.emitPropertyChange('brightness')
            .then(() => {
                
                this.emitEvent('onChangeBrightness', { ['brightness']: value })
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

    slide(name, inputs, options) {
        return this.writeBrightness('brightness', inputs.brightness, options);
    }

}

async function sub(wsManager, readGroup, dataT, pathname, target) {

    let configS = {
        requestType: "subscribe",
        group: readGroup,
        dataType: dataT
    };

    var sub = await WoTnectivity.sendRequest("192.168.1.38", configS, null);
    let url = 'ws://localhost:8080' + pathname;

    wsManager.wsClient.connect(url, 'echo-protocol');

    wsManager.wsClient.emitMessage((connection) => {
        console.log('WebSocket client connected for WoTKNXDimmer');
        function emitMessage(msg) {
            if(connection.connected) {
                console.log('Sending data %d to %s', msg, objective);
                let m = target + '#' + msg.toString();
                console.log('m', m);
                connection.send(m);
            } else {
                console.log('Connection lost...');
            }
        }

        sub.subscribe((data) => {
            eventData = data;
            emitMessage(data);
        });
    });
}