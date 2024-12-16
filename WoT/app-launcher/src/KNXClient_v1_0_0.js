import WoTnectivityKNX from 'wotnectivity-knx';

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
            WoTnectivityKNX.sendRequest(address, config, payload)
            .then((data) => {
                console.log("read data", data);
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
            
            WoTnectivityKNX.sendRequest(address, config, payload)
            .then((data) => {
                resolve(data);
            })
            .catch((error) => reject(error));
        });
    }
    
/*
    subscribe(address, groupP, dataTypeP) {
        /*var sub = await WoTnectivityKNX.sendRequest(address, config, null);
        sub.subscribe((data) => {
            return data;
        });* /
        
        return new Promise((resolve, reject) => {
            let config = {
                requestType: "subscribe",
                group: groupP,
                dataType: dataTypeP
            };
            WoTnectivityKNX.sendRequest(address, config, null)
            .then((sub) => {
                sub.subscribe((data) => {
                    
                    console.log('data', data);
                    //resolve(data); ==> solo lo hace 1 vez
                    
                });
            })
            .catch((error) => reject(error));
        });
    }

    async subscribeAsync(address, groupP, dataTypeP) {
        let config = {
            requestType: "subscribe",
            group: groupP,
            dataType: dataTypeP
        };

        var sub = await WoTnectivityKNX.sendRequest(address, config, null)
        sub.subscribe((data) => {
            console.log('subscribeAsync data', data);
            return data;
        });
    }

*/
}