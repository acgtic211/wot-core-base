import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCLedLine_v1_0_0 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();

        this.visible = false;
        this.httpClient = new HTTPClient_v1_0_0();
        this.mqttClient = new MQTTClient_v1_0_0();
    }

    connectedCallback() {
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        this.ledsHref = this.getAttribute('leds-href');
        this.onChangeLedStatusHref = this.getAttribute('onChangeLedStatus-href');

        let item = this.getItem(this.onChangeLedStatusHref);

        this.mqttClient.connect(item.hostname, item.port);

        this.mqttClient.setEvent('connect', (connack) => {
            console.log('--- CONNECT ---');

            this.mqttClient.subscribe(item.pathname);

            this.getLeds(this);
            setInterval(() => this.getLeds(this), 10000);

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

        this.mqttClient.setEvent('message', (hostname, port, topic, message, packet) => {
            console.log('messageLedLine', message);
            this.setLeds(this, message);
        });

        this.render(this);

        this.disableComponent(this, []);
        this.enabled = false;
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;

        let item = this.getItem(this.onChangeLedStatusHref);

        this.mqttClient.unsubscribe(item.pathname)
        .then(() => {
            console.log('--- UNSUBSCRING FROM EVENT ---');
        })
        .catch((error) => {
            console.log('--- ERROR UNSUBSCRIBING ---', error);
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
                    let img2 = component.createLeftContentImage('');
                    img2.id = 'img2';
                    let img3 = component.createLeftContentImage('');
                    img3.id = 'img3';
                    let img4 = component.createLeftContentImage('');
                    img4.id = 'img4';
			
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
                    div3a.appendChild(img2);
                    div3a.appendChild(img3);
                    div3a.appendChild(img4);
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

    getLeds(component) {
        let item = component.getItem(component.getAttribute('leds-href'));

        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((leds) => {
            console.log('leds', leds);
            component.setLeds(component, leds.leds);

            component.enabled = true;
        })
        .catch((error) => {
            if(component.enabled) {
                component.disableComponent(component, []);
                component.enabled = false;
            }
        });
    }

    setLeds(component, leds) {
        let img1 = component.shadow.getElementById('img1');
        let img2 = component.shadow.getElementById('img2');
        let img3 = component.shadow.getElementById('img3');
        let img4 = component.shadow.getElementById('img4');

        let img = [img1, img2, img3, img4];

        for(var i = 0; i < leds.length; i++){
            switch(leds[i]){
                case true:
                    img[i].setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/afaulconbridge-Lightbulb-OnOff-1.svg');
                    break;

                case false:
                    img[i].setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/afaulconbridge-Lightbulb-OnOff-2.svg');
                    break;

                default:
                    img[i].setAttribute('src', '');
                    break;
            }

        }

        component.enableComponent(component, []);
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

customElements.define('wc-ledline', WCLedLine_v1_0_0);