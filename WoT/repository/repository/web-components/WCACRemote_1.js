import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';
//Estos seran mqtts y https
import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { HTTPSClient_v1 } from 'http://localhost:38080/web-components/HTTPSClient_v1.js';

import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';
import { MQTTSClient } from 'http://localhost:38080/web-components/MQTTSClient.js';

export class WCACRemote_1 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();

        this.visible = false;
        this.mqttClient = new MQTTClient_v1_0_0();
		this.mqttsClient = new MQTTSClient();
        this.httpClient = new HTTPClient_v1_0_0();
		this.httpsClient = new HTTPSClient_v1();

    }


    async connectedCallback() {
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');

		//Propiedades
        this.temperatureHref = this.getAttribute('temperature-href');
        //this.alarmHref = this.getAttribute('alarm-href');
        
		//Eventos
		this.temperatureStatusHref = this.getAttribute('temperatureStatus-href');
		//this.alarmStatusHref = this.getAttribute('alarmStatus-href');

		//Acciones
        //this.toggleAlarmHref = this.getAttribute('toggleAlarm-href');
        this.increaseHref = this.getAttribute('increase-href');
        this.decreaseHref = this.getAttribute('decrease-href');

        let temp = this.getItem(this.temperatureStatusHref);
		//let alarm = this.getItem(this.alarmStatusHref);

        await this.mqttsClient.connect(temp.hostname, temp.port);

        this.mqttsClient.setEvent('connect', (connack) => {
            console.log('Connected to MQTT');

            this.mqttsClient.subscribe(temp.pathname);
			//this.mqttClient.subscribe(alarm.pathname);

            this.initACRemote(this);
            setInterval(() => this.initACRemote(this), 5000);
        });


        this.mqttsClient.setEvent('close', () => {

        });

        this.mqttsClient.setEvent('end', () => {
			console.log('--- END ---');
		});

		this.mqttsClient.setEvent('disconnect', () => {
			console.log('disconnect');
		});

		this.mqttsClient.setEvent('offline', () => {
			console.log('--- OFFLINE ---')		    

			this.disableComponent(this, []);
			this.enabled = false;

			//this.mqttClient.unsubscribe(item.pathname)
			this.mqttsClient.disconnect();

		});

        this.mqttsClient.setEvent('error', (error) => {
			console.log('error', error);
		});

		this.mqttsClient.setEvent('message', (hostname, port, topic, message, packet) => {
			console.log('---- MQTT Message ----');
            console.log(hostname, port, topic);
            console.log(message);
            console.log('----------------------');
			this.initACRemote(this);
		});


        this.render(this);

		this.disableComponent(this, []);
		this.enabled = false;
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;

        let item = this.getItem(this.temperatureStatusHref);
        
        this.mqttsClient.unsubscribe(item.pathname)
		.then(() => {
			// console.log('unsubscribe 1')		    
		})
		.catch((error) => {
			// console.log('unsubscribe 2', error)		    
		})
        .finally(() => {
            this.mqttsClient.disconnect();
        });
    }

    //Cambiar
    render(component, params) {
        super.render(component, params);

        let divContentTable = component.createTable(false, true);
		
			let divContentRow = component.createRow();

				let div3a = component.createLeftContentCell();
		
                    let temp = component.createLabel('');
                    temp.id = 'temp1';

					/*let alarmLbl = component.createLabel('');
					alarmLbl.id = 'ac1';*/
			
				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[' + component.location + ']');

					let pStatus = component.createContentValue(component.status);
					pStatus.id = 'pStatus';
						
					let pTimestamp = component.createContentTimestamp(component.timestamp);
					pTimestamp.id = 'pTimestamp';

					/*let toggleBTN = component.createButton('Toggle Alarm');
					toggleBTN.id = 'toggleAlarm';
					toggleBTN.onclick = () => {
						let tglItem = component.getItem(this.getAttribute('toggleAlarm-href'));
						this.httpClient.fetch(tglItem.hostname, tglItem.port, tglItem.pathname, 'post', 'application/json', undefined);

					}*/
					let increaseBTN = component.createButton('Increase');
					increaseBTN.id = 'increaseBTN';
					increaseBTN.onclick = () => {
						let inItem = component.getItem(this.getAttribute('increase-href'));
						this.httpsClient.fetch(inItem.hostname, inItem.port, inItem.pathname, 'post', 'application/json', undefined);
					}

					let decreaseBTN = component.createButton('Decrease');
					decreaseBTN.id = 'decreaseBTN';
					decreaseBTN.onclick = () => {
						let deItem = component.getItem(this.getAttribute('decrease-href'));
						this.httpsClient.fetch(deItem.hostname, deItem.port, deItem.pathname, 'post', 'application/json', undefined);
					}
			
				let div3e = component.createRightContentCell();
				div3e.onclick = () => component.config(component, []);

					let imgIcoAjustes = component.createRightContentImage('http://localhost:38080/web-components/ajustes.jpg');



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
					div3a.appendChild(temp);
					//div3a.appendChild(alarmLbl);
				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
					div3b.appendChild(pStatus);		
					div3b.appendChild(pTimestamp);		
					//div3b.appendChild(toggleBTN);
					div3b.appendChild(increaseBTN);
					div3b.appendChild(decreaseBTN);
					
				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
    }

    initACRemote(component) {

		let t = component.getItem(component.getAttribute('temperature-href'));
		//let s = component.getItem(component.getAttribute('alarm-href'));

		component.httpsClient.fetch(t.hostname, t.port, t.pathname, 'get', 'application/json', null)
		.then((temp) => {
			component.setTemperature(component, temp.temperature);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true){
                component.disableComponent(component, []);
                component.enabled = false;
            }
		});

		/*component.httpClient.fetch(s.hostname, s.port, s.pathname, 'get', 'application/json', null)
		.then((status) => {
			console.log(status);
			component.setAlarm(component, status.alarmStatus);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true){
                component.disableComponent(component, []);
                component.enabled = false;
            }
		});*/

    }

	setTemperature(component, temperature) {
		let lblTemp = component.shadow.getElementById('temp1');
		lblTemp.innerText = "Temperature: " + temperature;

		component.enableComponent(component, []);
	}

	/*setAlarm(component, al) {
		let lblStatus = component.shadow.getElementById('ac1');
		let atxt;

		al ? atxt = 'active' : atxt = 'inactive'; 
		lblStatus.innerText = "Alarm: " + atxt;

		component.enableComponent(component, []);
	}*/

    config(component, params) {
		component.visible = !component.visible;
		
		if(component.visible === true) {
			component.shadow.getElementById('config').style.display = 'table';
		} else {
			component.shadow.getElementById('config').style.display = 'none';
		}
	}


}

customElements.define('wc-acremote', WCACRemote_1);