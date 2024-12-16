import * as client from 'websocket';
import { KNXClient_v1_0_0 } from './KNXClient_v1_0_0.js';

export class WSClient_v1_0_0 {
    constructor() {
        this.client = new client.default.client();
        this.knxClient = new KNXClient_v1_0_0();
        
    }

    connect(url, protocol){
        //console.log(WebSocket);
        this.client.connect(url, protocol);
        this.client.onopen = function (event) {
            console.log('Connected to Websockets');
        }

    }

    setEvent(action){
        
        this.client.onmessage = function(event1) {
            console.log('<-- received message');
            action(event1);
        };
        
    }

    emitMessage(action){
        this.client.on('connect', function(connection) {
            action(connection);
        })
    }

    disconnect(){
        
    }


}

