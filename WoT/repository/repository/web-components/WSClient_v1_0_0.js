import { KNXClient_v1_0_0 } from './KNXClient_v1_0_0.js';

export class WSClient_v1_0_0 {
    constructor() {
        this.client = null;
        this.knxClient = new KNXClient_v1_0_0();
        
    }

    connect(url, protocol){
        this.client = new WebSocket(url, protocol);
        this.client.onopen = function (event) {
            console.log('Connected to Websockets', url);
        }

    }

    setEvent(action){
        
        this.client.onmessage = function(event1) {
            console.log('<-- received message');
            action(event1);
        };
        
    }

    disconnect(){
        
    }


}

