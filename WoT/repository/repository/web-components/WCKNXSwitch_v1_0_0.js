import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCKNXSwitch_v1_0_0 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();

        this.visible = false;
        this.httpClient = new HTTPClient_v1_0_0();
        //this.mqttClient = new MQTTClient_v1_0_0();
        //this.knxClient = new KNXClient_v1_0_0();
        //this.wsClient = new WSClient_v1_0_0();
    }


    connectedCallback() {
        super.connectedCallback();
        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        this.statusHref = this.getAttribute('status-href');
        
        this.onChangeStatusHref = this.getAttribute('onchangestatus-href');
        this.toggleStatusHref = this.getAttribute('toggleStatus-href');
        this.statusDDHref = this.getAttribute('dd-href');


       /*let item = this.getItem(this.onChangeStatusHref);

        this.mqttClient.connect(item.hostname, item.port);

        this.mqttClient.setEvent('connect', (connack) => {
            console.log('--- CONNECT ---');

            this.mqttClient.subscribe(item.pathname);

            this.getStatus(this);
            setInterval(() => this.getStatus(this), 10000);
        });

        this.mqttClient.setEvent('message', (hostname, port, topic, message, packet) => {
            console.log('message', message);
            this.setStatus(this, message);
        });

        this.mqttClient.setEvent('close', () => {
			// console.log('close');
		});

		this.mqttClient.setEvent('end', () => {
			console.log('--- END ---');
		});

		this.mqttClient.setEvent('disconnect', () => {
			console.log('disconnect');
		});

		this.mqttClient.setEvent('offline', () => {
			console.log('--- OFFLINE ---')		    

			this.disableComponent(this, []);
			this.enabled = false;

			//this.mqttClient.unsubscribe(item.pathname)
			this.mqttClient.disconnect();

		});

		this.mqttClient.setEvent('error', (error) => {
			console.log('error', error);
		});

        this.evtSource.onmessage = ((event) => {
            let a = JSON.parse(event.data);
            
            let b = JSON.parse(a);
            console.log(a, b);
            this.setStatus(this, b.value);
        });*/
        

        this.render(this);
        this.getStatus(this);
        setInterval(() => this.getStatus(this), 5000);
        this.enableComponent(this, []);

    }

    disconnectedCallback() {
        super.disconnectedCallback();

        let item = this.getItem(this.onChangeStatusHref);

        this.mqttClient.unsubscribe(item.pathname)
        .then(() => {
            console.log('--- Unsubscribed from event ---');
        })
        .catch((error) => {
            console.log('--- Error unsubscribing ---', error);
        })
        .finally(() => {
            this.mqttClient.disconnect();
        });
    }

    render(component, params) {
        super.render(component, params);

        let divContentTable = component.createTable(false, true);
		
			let divContentRow = component.createRow();

				let div3a = component.createLeftContentCell();
		
                    let img1 = component.createLeftContentImage('');
                    img1.id = 'img1';
                    img1.onclick = () => component.toggle(component);
                    
			
				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[ Universidad de Almería ]');

					let pStatus = component.createContentValue(component.status);
					pStatus.id = 'pStatus';
						
					let pTimestamp = component.createContentTimestamp(component.timestamp);
					pTimestamp.id = 'pTimestamp';
			
				let div3e = component.createRightContentCell();
				div3e.onclick = () => component.config(component, []);

					let imgIcoAjustes = component.createRightContentImage('https://acgsaas.ual.es:443/core-repo/web-components/ajustes.jpg');



		let divConfigTable = component.createTable(false, true);
		divConfigTable.id = 'config';
		divConfigTable.style.display = 'none';
		
			let divConfigRow = component.createRow();
		
				let divConfigCell = component.createConfigCell();
						
					let pConfigTitle = component.createConfigTitle('Configuration');
						
					let pConfigText = component.createConfigText('Configuration not available...');

					
		
		let componentTableCell1 = component.shadow.getElementById('componentTableCell1');
			
		componentTableCell1.appendChild(divContentTable);
			divContentTable.appendChild(divContentRow);		
				divContentRow.appendChild(div3a);		
					div3a.appendChild(img1);

				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
					//div3b.appendChild(pStatus);		
					//div3b.appendChild(pTimestamp);		
				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
    }

    getStatus(component) {
        let item = component.getItem(component.getAttribute('status-href'));
        let item2 = component.getItem(component.getAttribute('dd-href'));
        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((status) => {

            component.httpClient.fetch(item2.hostname, '443', item2.pathname, 'get', 'application/json', null)
            .then((data) => {
                
                if(data.value !== status.status.value){
                    let toggle = component.getItem(this.toggleStatusHref);
                    component.httpClient.fetch(toggle.hostname, toggle.port, toggle.pathname, 'post', 'application/json', { value: data.value });
                }
            })
            //console.log('status', status.status);
            component.setStatus(component, status.status);
            
            component.enabled = true;
        })
        .catch((error) => {
            if(component.enabled) {
                component.disableComponent(component, []);
                component.enabled = false;
            }
        });
    }

    setStatus(component, status) {
        let img1 = component.shadow.getElementById('img1');
        
        switch(status.value){
            case true:
                img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-on.svg');
                break;

            case false:
                img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-off.svg');
                break;

            default:
                img1.setAttribute('src', '');
                break;
        }

        component.enableComponent(component, []);

    }

    toggle(component) {
        
        let item = component.getItem(this.statusHref);
        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((data) => {
            let toggle = component.getItem(this.toggleStatusHref);
            console.log("data", data.status.value);
            component.httpClient.fetch(toggle.hostname, toggle.port, toggle.pathname, 'post', 'application/json', { value: !data.status.value });
        })
        .catch((error) => {
            if(component.enabled) {
                component.disableComponent(component, []);
                component.enabled = false;
            }
        });
    }

    config(component, params) {
		component.visible = !component.visible;
		
		if(component.visible === true) {
			component.shadow.getElementById('config').style.display = 'table';
		} else {
			component.shadow.getElementById('config').style.display = 'none';
		}
	}
}

customElements.define('wc-knxswitch', WCKNXSwitch_v1_0_0);