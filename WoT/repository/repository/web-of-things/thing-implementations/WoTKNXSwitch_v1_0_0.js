import WoTnectivity from 'wotnectivity-knx';

var eventData = false;
/*
import * as client from 'websocket';

var wsClient = new client.default.client();*/


export class WoTKNXSwitch_v1_0_0 {

    constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent){
        this.datastore = {
            status: eventData,
            address: config.address,
            readGroup: config.readGroup,
            writeGroup: config.writeGroup,
            dataType: config.dataType,
            pathname: config.pathname,
            target: config.target
        };


        this.securityManager = securityManager;
        this.protocolManager = protocolManager;

        this.emitEvent = emitEvent;
        this.emitPropertyChange = emitPropertyChange;

        this.handlers = {
            'status': {
                'readHandler': (options) => this.readStatus(options),
                'writeHandler': (name, value, options) => this.writeStatus(name, value, options),
                'observeHandler': (options) => this.readStatus(options)
            },
            'toggle': {
                'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
            }
        };
    
        
       //sub(this.protocolManager.wsManager, this.datastore.readGroup, this.datastore.dataType, this.datastore.pathname, this.datastore.target);
    
    }

    readStatus(options) {
        return new Promise((resolve, reject) => {
            
            resolve({ ['status']: eventData })
        });

    }

    writeStatus(name, value, options) {

        return new Promise((resolve, reject) => {
            
            eventData = value;
            
            this.emitPropertyChange('status')
            .then(() => {
                this.emitEvent('onChangeStatus', {"value": value})
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
 
    }

    toggle(name, inputs, options) {
        return this.writeStatus('status', inputs.status, options);
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
        console.log('WebSocket client connected for WoTKNXSwitch');

        function emitMessage(msg) {
            if(connection.connected) {
                let objective = '/wcknxswitch-1';
                console.log('Sending data %s to %s', msg, objective);
                
                let m2 = target + '#' + msg.toString();
                console.log('m2', m2);
                connection.send(m2);
                
                //setTimeout(emitMessage, 1000);
            } else {
                console.log('Connection lost...');
            }
        }

        sub.subscribe((data) => {
            //console.log('WoTKNXSwitch event', data);
            eventData = data;
            emitMessage(data);
            
        });
    });

   
}
