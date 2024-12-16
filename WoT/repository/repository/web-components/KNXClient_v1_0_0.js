//import sendRequest from 'http://wot-core-repository-entrypoint:38080/node-modules/wotnectivity-knx/src/index.js';

export class KNXClient_v1_0_0 {
    constructor() {
        
    }


    sendRead(address, groupP, dataTypeP) {
        return new Promise((resolve, reject) => {
            let config = {
                requestType: "read",
                group: groupP,
                dataType: dataTypeP
            }
            let payload = null;
            
            sendRequest(address, config, payload)
            .then((data) => {
                //console.log("read data", data);
                resolve(data)
            })
            .catch((error) => reject(error));
        });
    }

    sendWrite(address, groupP, dataTypeP, payload) {
        return new Promise((resolve, reject) => {
            let config = {
                requestType: "write",
                group: groupP,
                dataType: dataTypeP
            }
            /*console.log("KNXCLIENT WRITE", {
                address:address,
                config: config,
                payload: payload
            });*/
            sendRequest(address, config, payload)
            .then((data) => {
                console.log('write data', data);
                resolve(data);
            })
            .catch((error) => reject(error));
        });
    }
    

    subscribe(address, groupP, dataTypeP) {
        /*var sub = await WoTnectivityKNX.sendRequest(address, config, null);
        sub.subscribe((data) => {
            return data;
        });*/
        
        return new Promise((resolve, reject) => {
            let config = {
                requestType: "subscribe",
                group: groupP,
                dataType: dataTypeP
            };
            sendRequest(address, config, null)
            .then((sub) => {
                sub.subscribe((data) => {
                    resolve(data);
                });
            })
            .catch((error) => reject(error))
        })
    }

    

}