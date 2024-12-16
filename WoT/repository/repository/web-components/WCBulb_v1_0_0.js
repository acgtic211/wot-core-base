import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCBulb_v1_0_0 extends WCThingPack1_v1_0_0 {
	constructor() {
		super();
		
		this.visible = false;

		this.httpClient = new HTTPClient_v1_0_0();
		this.mqttClient = new MQTTClient_v1_0_0();
	}
	
	connectedCallback() {
		super.connectedCallback();
		// console.log('connectedCallback')		    
		
		this.identifier = this.getAttribute('identifier');
		this.location = this.getAttribute('location');
		this.statusHref = this.getAttribute('status-href');
		this.onChangeStatusHref = this.getAttribute('onChangeStatus-href');

		
		let item = this.getItem(this.onChangeStatusHref);

		/*console.log({
			"identifier": this.identifier,
			"location": this.location,
			"statusHref": this.statusHref,
			"onChangeStatusHref": this.onChangeStatusHref,
			"item": item
		});*/

		this.mqttClient.connect(item.hostname, item.port);
		// console.log(item.hostname, item.port)		    

		this.mqttClient.setEvent('connect', (connack) => {
			console.log('--- CONNECT ---')		    
			// console.log(item.pathname)		    

		    this.mqttClient.subscribe(item.pathname)

			this.getStatus(this);
			setInterval(() => this.getStatus(this), 10000);

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
			console.log(message)		    

			this.setStatus(this, message.status);
		});
		
		
		this.render(this);

		this.disableComponent(this, []);
		this.enabled = false;

	}
	
	disconnectedCallback() {
		super.disconnectedCallback();
		// console.log('disconnectedCallback')		    


		this.disableComponent(this, []);
		this.enabled = false;


		let item = this.getItem(this.onChangeStatusHref);

		this.mqttClient.unsubscribe(item.pathname)
		.then(() => {
			// console.log('unsubscribe 1')		    
		})
		.catch((error) => {
			// console.log('unsubscribe 2', error)		    
		})
		.finally(() => {
			// console.log('unsubscribe 3')		    
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
		
		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
		.then((status) => {

			component.setStatus(component, status.status);
			//console.log({"status":status});
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true) {
				component.disableComponent(component, []);
				
				component.enabled = false;
			}
		});
	}

	
	setStatus(component, status) {
		let img1 = component.shadow.getElementById('img1');
		
		switch(status) {
			case true:
				img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/afaulconbridge-Lightbulb-OnOff-1.svg');
				break;
				
			case false:
				img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/afaulconbridge-Lightbulb-OnOff-2.svg');
				break;
				
			default:
				img1.setAttribute('src', '');
				break;
		}
		
		/*let pStatus = component.shadow.getElementById('pStatus');
		if(status === null) {
			pStatus.innerHTML = '-';
		} else {
			pStatus.innerHTML = status.value;
		}*/

		/*if(status.timestamp !== undefined)
		{
			let pTimestamp = component.shadow.getElementById('pTimestamp');
			let d = new Date(status.timestamp);
			
			pTimestamp.innerHTML = '';
			pTimestamp.innerHTML += d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
			pTimestamp.innerHTML += '&nbsp;&nbsp;&nbsp;';
			pTimestamp.innerHTML += d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth()+1).toString().padStart(2, '0') + '/' + d.getFullYear();
		}*/
		
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

customElements.define('wc-bulb', WCBulb_v1_0_0);
