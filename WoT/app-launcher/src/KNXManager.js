import { KNXClient_v1_0_0 } from './KNXClient_v1_0_0.js';

export class KNXManager {
    constructor(config) {
        this.config = config;
        this.hosts = {};

        this.client = new KNXClient_v1_0_0();
    }

    readService(address, group, dataType) {
        return new Promise ((resolve, reject) => {
            this.client.sendRead(address, group, dataType)
            .then((data) => {
                //console.log('ReadService data: ', data);
                resolve(data)
            })
            .catch((error) => reject(error));
        });
    }

    writeService(address, group, dataType, value) {
        return new Promise ((resolve, reject) => {
            this.client.sendWrite(address, group, dataType, value)
            .then((data) => resolve(data))
            .catch((error) => reject(error));
        })
    }

    async subscribe(address, group, dataType) {
        /*return new Promise ((resolve, reject) => {
            this.client.subscribeAsync(address, group, dataType)
            .then((data) => {
                console.log('manager data', data);
                return data;
            })
            .catch((error) => reject(error));
        });*/
        await this.client.subscribeAsync(address, group, dataType)
        .then((data) => {
            console.log('manager data', data);
            return data;
        })
        .catch((error) => reject(error));
    }
    


}