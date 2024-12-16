import { MQTTManager } from './MQTTManager.js';
import { MQTTSClient } from './MQTTSClient.js';

export class MQTTSManager extends MQTTManager {
    constructor(config){
        super(config);
        
    }

    initializeService(request) {
        return new Promise((resolve, reject) => {
            
            switch(request.op){
                case 'readproperty':
				case 'writeproperty':
				case 'observeproperty':
				case 'unobserveproperty':
				case 'invokeaction':
				case 'subscribeevent':
				case 'unsubscribeevent':
                default:
                    if(this.find(request.hostname, request.port) === undefined) {
                       
                        let externalServer = ((this.config.server.hostname === request.hostname) && (parseInt(this.config.server.port) === parseInt(request.port))) ? false : true;
                        
                        let info = this.register(request.hostname, request.port);
        
                        info.mqtt = new MQTTSClient();
                        
                        info.mqtt.connect(request.hostname, request.port, true, externalServer);
                        
                        
                        let interval = setTimeout(() => {
                            info.mqtt.disconnect(request.hostname, request.port)
                            .then((response) => {
                                console.log('MQTTSClient disconnected...');
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                            .finally(() => {
                                reject(new Error('Client not connected...', 'NetworkError'));
                            });
                        }, this.config.reconnectPeriod);
        
                        info.mqtt.setEvent('connect', (connack) => {
                            clearTimeout(interval);
                            //console.log('MQTTSMan - 48 --> Connected to mqtts first time');
                            if(info.firstConnection === false) {
                                
                                let ops = this.find(request.hostname, request.port);
                                
                                info.mqtt.setEvent('message', (hostname, port, topic, message, packet) => {
                                    let ops = this.find(hostname, port);
        
                                    if(ops !== undefined) {
                                        
                                        Object.keys(ops.thingIds).forEach((thingId) => {
                                            Object.keys(ops.thingIds[thingId].topics).forEach((topic2) => {
                                                if(
                                                    ((topic2.charAt(topic2.length - 1) === '#') && (topic.indexOf(topic2.substring(0, topic2.length-1)) === 0)) ||
                                                    (topic2 === topic)
                                                ) {
                                                    Object.keys(ops.thingIds[thingId].topics[topic2]).forEach((op) => {
                                                        if(ops.thingIds[thingId].topics[topic2][op].callbackOk !== undefined) {
                                                            switch(op) {
                                                                case 'writeproperty':
                                                                    ops.thingIds[thingId].topics[topic2][op].callbackOk(
                                                                        ops.thingIds[thingId].topics[topic2][op].params.name,
                                                                        message,
                                                                        ops.thingIds[thingId].topics[topic2][op].params.options,
                                                                        ops.thingIds[thingId].topics[topic2][op].params.mode,
                                                                        ops.thingIds[thingId].topics[topic2][op].params.td
                                                                    );
                                                                    break;
                                                                    
                                                                case 'invokeaction':
                                                                    ops.thingIds[thingId].topics[topic2][op].callbackOk(
                                                                        ops.thingIds[thingId].topics[topic2][op].params.name,
                                                                        message,
                                                                        ops.thingIds[thingId].topics[topic2][op].params.options,
                                                                        ops.thingIds[thingId].topics[topic2][op].params.td
                                                                    );
                                                                    break;
                                                                    
                                                                    
                                                                    
                                                                // ConsumedThing
                                                                
                                                                case 'readproperty':
                                                                    ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
                                                                    break;
                                                                
                                                                case 'observeproperty':
                                                                    ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
                                                                    break;
                                                                
                                                                case 'subscribeevent':
                                                                                                                        
                                                                    ops.thingIds[thingId].topics[topic2][op].callbackOk(message);
                                                                    break;
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                                
                                info.mqtt.setEvent('error', (error) => {
                                    
                                    switch(error.code) {
                                        case 'ECONNREFUSED':
                                            break;
                                        
                                        default:
                                            
                                            if(ops !== undefined) {
                                                Object.keys(ops.thingIds).forEach((thingId) => {
                                                    Object.keys(ops.thingIds[thingId].topics).forEach((topic) => {
                                                        Object.keys(ops.thingIds[thingId].topics[topic]).forEach((op) => {
                                                            if(ops.thingIds[thingId].topics[topic][op].callbackError !== undefined) {
                                                                ops.thingIds[thingId].topics[topic][op].callbackError(new Error('Client went offline...', 'NetworkError'));
                                                            }
                                                        });
                                                    });
                                                });
                                            }
                                            break;
                                    }
                                });
                                
                                info.mqtt.setEvent('close', () => {

                                    let ops = this.find(request.hostname, request.port);
        
                                    if(ops !== undefined) {
                                        Object.keys(ops.thingIds).forEach((thingId) => {
                                            Object.keys(ops.thingIds[thingId].topics).forEach((topic) => {
                                                Object.keys(ops.thingIds[thingId].topics[topic]).forEach((op) => {
                                                    if(ops.thingIds[thingId].topics[topic][op].callbackError !== undefined) {
                                                        ops.thingIds[thingId].topics[topic][op].callbackError(new Error('Client went offline...', 'NetworkError'));
                                                    }
                                                });
                                            });
                                        });
                                    }
                                });
                            }
        
                            resolve();
                        });
                    } else {
                        let info = this.find(request.hostname, request.port);
                        let total = 0;
                        if(info.mqtt.isConnected() === false) {
                            let interval = setInterval(() => {
                                total += 1000;
                                
                                info.mqtt.connect(request.hostname, request.port, false, true);
                                
                                
                                if(total >= this.config.reconnectPeriod) {
                                    clearInterval(interval);
                                    if(info.mqtt.isConnected() === false) {
                                        console.log(request);
                                        console.log("MQTTSMan - 170 --> MQTTS not connected");
                                        reject(new Error('Client not connected...', 'NetworkError'));
                                    } else {
                                        resolve();
                                    }
                                }
        
                                /*if(info.mqtt.isConnected() === false) {
                                    //console.log(info.mqtt);
                                    console.log({"hostname": request.hostname, "port": request.port});
                                    reject(new Error('Client not connected...', 'NetworkError'));
                                } else {
                                    resolve();
                                }*/

                                if(info.mqtt.isConnected()) {
                                    //console.log("MQTTSMan - 184 --> mqtts is connected to %s : %s", request.hostname, request.port);
                                    resolve();
                                }
                            })


                        } else {
                            //console.log("MQTTSMan - 191 --> MQTTS already connected");
                            resolve();
                        }
                    }
                    break;
            }
        });
    }

}