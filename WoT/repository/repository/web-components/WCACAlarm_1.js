import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';
//Estos seran mqtts y https
import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCACAlarm_1 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();

        this.visible = false;
        this.mqttClient = new MQTTClient_v1_0_0();
        this.httpClient = new HTTPClient_v1_0_0();
    }


    connectedCallback() {
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');

		//Propiedades
        this.temperatureHref = this.getAttribute('temperature-href');
        this.alarmHref = this.getAttribute('alarm-href');

		//Eventos
        this.alarmStatusHref = this.getAttribute('alarmStatus-href');
		this.tempStatusHref = this.getAttribute('temperatureStatus-href');

        let alarm = this.getItem(this.alarmStatusHref);
		let temp = this.getItem(this.tempStatusHref);

        this.mqttClient.connect(temp.hostname, '9001');

        this.mqttClient.setEvent('connect', (connack) => {
            console.log('Connected to MQTT');

            this.mqttClient.subscribe(alarm.pathname);
			this.mqttClient.subscribe(temp.pathname);

            this.initACAlarm(this);
            setInterval(() => this.initACAlarm(this), 5000);
        });


        this.mqttClient.setEvent('close', () => {

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
			console.log('---- MQTT Message ----');
            console.log(hostname, port, topic);
            console.log(message);
            console.log('----------------------');
		
		});


        this.render(this);

		this.disableComponent(this, []);
		this.enabled = false;
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;
        
        let item = this.getItem(this.alarmTriggeredHref);

        this.mqttClient.unsubscribe(item.pathname)
		.then(() => {
			// console.log('unsubscribe 1')		    
            
		})
		.catch((error) => {
			// console.log('unsubscribe 2', error)		    
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

					let img = component.createLeftContentImage('');
					img.id = 'img1';

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
					div3a.appendChild(img);		
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

    initACAlarm(component) {
		let a = component.getItem(component.getAttribute('alarm-href'));
		let t = component.getItem(component.getAttribute('temperature-href'));

		console.log(a);

		component.httpClient.fetch(a.hostname, a.port, a.pathname, 'get', 'application/json', null)
		.then((alarm) => {
			component.setAlarm(component, alarm.alarm);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true){
                component.disableComponent(component, []);
                component.enabled = false;
            }
		})

		component.httpClient.fetch(t.hostname, t.port, t.pathname, 'get', 'application/json', null)
		.then((temp) => {
			console.log(temp);
			component.setAlarm(component, temp);
		})
		.catch((error) => {
			console.log(error);
		})
    }

	setAlarm(component, temp) {
		let img = component.shadow.getElementById('img1');

		if(temp.temperature > 27) {
			img.setAttribute('src', 'http://localhost:38080/web-components/WX_circle_red.png');
		} else if (temp.temperature < 20) {
			img.setAttribute('src', 'http://localhost:38080/web-components/WX_circle_red.png');
		} else {
			img.setAttribute('src', 'http://localhost:38080/web-components/WX_circle_green.png');
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

customElements.define('wc-acalarm', WCACAlarm_1);