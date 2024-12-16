import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';
//Estos seran mqtts y https
import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { HTTPSClient_v1 } from 'http://localhost:38080/web-components/HTTPSClient_v1.js';

import { MQTTSClient } from 'http://localhost:38080/web-components/MQTTSClient.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCAC_1 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();

        this.visible = false;
        this.mqttsClient = new MQTTSClient();
		this.httpsClient = new HTTPSClient_v1();
        this.httpClient = new HTTPClient_v1_0_0();
		//this.mqttClient = new MQTTClient_v1_0_0();
		this.wsClient = null;

    }


    async connectedCallback() {
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        
		//Propiedades
		this.temperatureHref = this.getAttribute('temperature-href');
        this.alarmHref = this.getAttribute('alarm-href');
        
		//Eventos
		this.temperatureStatusHref = this.getAttribute('temperatureStatus-href');
        this.alarmStatusHref = this.getAttribute('alarmStatus-href');
		
		//Acciones (Creo que sobran)
		this.increaseHref = this.getAttribute('increase-href');
		this.decreaseHref = this.getAttribute('decrease-href');
		
        let temp = this.getItem(this.temperatureStatusHref);
        let alarm = this.getItem(this.alarmStatusHref);

        await this.mqttsClient.connect(temp.hostname, temp.port);

        this.mqttsClient.setEvent('connect', (connack) => {
            console.log('Connected to MQTTS', this.mqttsClient);
			
            this.mqttsClient.subscribe(temp.pathname);
            this.mqttsClient.subscribe(alarm.pathname);

            this.initAC(this);
            setInterval(() => this.initAC(this), 10000);
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
			this.initAC(this);
		});

		this.initAC(this);
		setInterval(() => this.initAC(this), 10000);
        this.render(this);

		this.disableComponent(this, []);
		this.enabled = false;
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;

        let item = this.getItem(this.temperatureStatusHref);
        let item2 = this.getItem(this.alarmStatusHref);

        this.mqttClient.unsubscribe(item.pathname)
		.then(() => {
			// console.log('unsubscribe 1')		    
            this.mqttClient.unsubscribe(item2.pathname)
            .catch((error) => {

            })
            .finally(() => {
                this.mqttClient.disconnect();
            });
		})
		.catch((error) => {
			// console.log('unsubscribe 2', error)		    
		});
    }

    render(component, params) {
        super.render(component, params);

        let divContentTable = component.createTable(false, true);
		
			let divContentRow = component.createRow();

				let div3a = component.createLeftContentCell();
		
                    let temperature = component.createLabel('');
                    temperature.id = 'temp1';

					let alarm = component.createLabel('');
					alarm.id = 'alarm1';

				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[' + component.location + ']');

					let pStatus = component.createContentValue(component.status);
					pStatus.id = 'pStatus';
						
					let pTimestamp = component.createContentTimestamp(component.timestamp);
					pTimestamp.id = 'pTimestamp';
			
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
					div3a.appendChild(temperature);
					div3a.appendChild(alarm);
				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
					div3b.appendChild(pStatus);		
					div3b.appendChild(pTimestamp);		
				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
    }

    initAC(component) {

		let t = component.getItem(component.getAttribute('temperature-href'));
		let a = component.getItem(component.getAttribute('alarm-href'));

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

		component.httpsClient.fetch(a.hostname, a.port, a.pathname, 'get', 'application/json', null)
		.then((alarm) => {
			component.setAlarm(component, alarm.alarm);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true){
                component.disableComponent(component, []);
                component.enabled = false;
            }
		});

    }

	setTemperature(component, temperature) {
		let lblTemp = component.shadow.getElementById('temp1');
		lblTemp.innerText = "Temperature: " + temperature;

		component.enableComponent(component, []);
	}

	setAlarm(component, alarm) {
		let lblAlarm = component.shadow.getElementById('alarm1');
		let atxt;

		alarm ? atxt = 'active' : atxt = 'inactive'; 

		lblAlarm.innerText = "Alarm: " + atxt;

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

customElements.define('wc-ac', WCAC_1);