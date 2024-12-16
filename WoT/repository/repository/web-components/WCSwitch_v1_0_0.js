import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCSwitch_v1_0_0 extends WCThingPack1_v1_0_0 {
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
		this.statusHref = this.getAttribute('status-href');
		this.pressHref = this.getAttribute('press-href');
		this.onChangeStatusHref = this.getAttribute('onChangeStatus-href');

		
		let item = this.getItem(this.onChangeStatusHref);

		
		this.mqttClient.connect(item.hostname, item.port);

		this.mqttClient.setEvent('connect', (connack) => this.mqttClient.subscribe(item.pathname));

		this.mqttClient.setEvent('message', (topic, message, packet) => {
			let status = JSON.parse(message);
			
			this.setStatus(this, status.status);
		});
		
		this.mqttClient.setEvent('offline', () => this.mqttClient.unsubscribe(item.pathname));

		this.render(this);
		
		this.getStatus(this);
		setInterval(() => this.getStatus(this), 10000);

		this.enableComponent(this, []);
	}
	
	disconnectedCallback() {
		super.disconnectedCallback();
		
		
		let item = this.getItem(this.onChangeStatusHref);

		this.mqttClient.unsubscribe(item.pathname)
		.then(() => {})
		.catch((error) => {})
		.finally(() => {
			this.mqttClient.disconnect();
		});
	}
	
	
	render(component, params) {
		super.render(component, params);

		
		let divContentTable = component.createTable(false, true);

			let divContentRow = component.createRow();
			
				let div3a = component.createLeftContentCell();
				div3a.style.cursor = 'pointer';
				// div3a.onclick = () => component.press(component, []);
				div3a.onmousedown = () => component.mousedown(component, []);
				div3a.onmouseup = () => component.mouseup(component, []);
				div3a.onmouseleave = () => component.mouseleave(component, []);
		
					let img1 = component.createLeftContentImage('');
					img1.id = 'img1';
					img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-off.svg');
			
				let div3b = component.createCenterContentCell();
				div3b.style.cursor = 'pointer';
				// div3b.onclick = () => component.press(component, []);
				div3b.onmousedown = () => component.mousedown(component, []);
				div3b.onmouseup = () => component.mouseup(component, []);
				div3b.onmouseleave = () => component.mouseleave(component, []);

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[ Universidad de Almería ]');

//					let pStatus = component.createContentValue(component.status);
//					pStatus.id = 'pStatus';
						
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
//					div3b.appendChild(pStatus);		
					//div3b.appendChild(pTimestamp);		
				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
	}

/*	
	press(component) {
		let item = component.getItem(component.getAttribute('press-href'));

		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', null);
	}
*/
	
	mousedown(component) {
		let img1 = component.shadow.getElementById('img1');
		img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-on.svg');
	}

	
	mouseup(component) {
		let img1 = component.shadow.getElementById('img1');
    	img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-off.svg');
    	
		let item = component.getItem(component.getAttribute('press-href'));
		//console.log(item);
		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', null);
		
	}

	
	mouseleave(component) {
		let img1 = component.shadow.getElementById('img1');
    	img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-off.svg');
	}



	getStatus(component) {
		let item = component.getItem(component.getAttribute('status-href'));
		//console.log({"item":item});
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
		let pTimestamp = component.shadow.getElementById('pTimestamp');

/*		
		switch(status.value) {
			case 'on':
				img1.setAttribute('src', 'http://192.168.101.92:38080/web-components/cyberscooty-switch-on.svg');
				break;
				
			case 'off':
				img1.setAttribute('src', 'http://192.168.101.92:38080/web-components/cyberscooty-switch-off.svg');
				break;
				
			default:
				img1.setAttribute('src', '');
				break;
		}
		
		let pStatus = component.shadow.getElementById('pStatus');
		pStatus.innerHTML = status.value;
*/
/*
		if(status.timestamp !== undefined)
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

customElements.define('wc-switch', WCSwitch_v1_0_0);