import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
//import { HTTPSClient_v1 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPSClient_v1.js';

import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';
//import { MQTTSClient } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTSClient.js';

export class WCAlarmLight_v1_0_0 extends WCThingPack1_v1_0_0 {
	constructor() {
		super();
		
		this.visible = false;
		
		this.alarm = null;

		this.mqttsClient = new MQTTClient_v1_0_0();
		//this.mqttsClient = new MQTTSClient();
        this.httpsClient = new HTTPClient_v1_0_0();
		//this.httpsClient = new HTTPSClient_v1();
		
	}
	
	
	async connectedCallback() {
		super.connectedCallback();

		this.identifier = this.getAttribute('identifier');
		this.location = this.getAttribute('location');
		this.statusHref = this.getAttribute('status-href');
		this.toggleHref = this.getAttribute('toggle-href');
		this.onChangeStatusHref = this.getAttribute('onChangeStatus-href');
		this.alarmHref = this.getAttribute('alarm-href');
		this.onChangeAlarmHref = this.getAttribute('onChangeAlarm-href');

		
		let item = this.getItem(this.onChangeStatusHref);
		let item2 = this.getItem(this.onChangeAlarmHref);

		await this.mqttsClient.connect(item.hostname, item.port);

		this.mqttsClient.setEvent('connect', (connack) => {
			console.log("Connected to MQTTS");
			this.mqttsClient.subscribe(item.pathname);
			this.mqttsClient.subscribe(item2.pathname);
		});

       	this.mqttsClient.setEvent('message', (hostname, port, topic, message, packet) => {
			if(topic === item.pathname){
				this.setStatus(this, message.status);
			} else if(topic === item2.pathname){
				this.setAlarm(this, message.alarm);
			}
		});
		
		this.mqttsClient.setEvent('offline', () => {
			this.mqttsClient.unsubscribe(item.pathname);
			this.mqttsClient.unsubscribe(item2.pathname);
		});


		this.render(this);
		
		setInterval(() => {
			this.getStatus(this);
			this.getAlarm(this);
		}, 10000);
		
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
		
		
		let item2 = this.getItem(this.onChangeAlarmHref);

		this.mqttClient2.unsubscribe(item2.pathname)
		.then(() => {})
		.catch((error) => {})
		.finally(() => {
			this.mqttClient2.disconnect();
		});
	}
	
	
	render(component, params) {
		super.render(component, params);

		
		let divContentTable = component.createTable(false, true);

			let divContentRow = component.createRow();
			
				let div3a = component.createLeftContentCell();
				div3a.style.cursor = 'pointer';
				div3a.onclick = () => component.toggle(component, []);
		
					let img1 = component.createLeftContentImage('');
					img1.id = 'img1';
					img1.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/cyberscooty-switch-off.svg');
			
				let div3b = component.createCenterContentCell();
				div3b.style.cursor = 'pointer';
				div3b.onclick = () => component.toggle(component, []);

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[' + component.location + ']');

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

					let pConfigText = component.createConfigText('Alarm');
					
					

					let style = '';
					style += 'color: grey;';
					style += 'font-family: arial;';
					style += 'font-size: 10px;';
					style += 'margin: 0px;';
					style += 'padding: 0px;';
					
//--------------------------------------------------------------------------------------------------------------

					let hourInput = document.createElement('input');
					hourInput.id = 'hour';
					hourInput.type = 'range';
					hourInput.min = '0';
					hourInput.max = '23';
					hourInput.step = '1';
					hourInput.setAttribute('list', 'hourlist');
					hourInput.value = '0';
					hourInput.oninput = () => component.onInputHour(component);
					hourInput.onchange = () => component.onChangeHour(component);
					
					
					let hourDatalist = document.createElement('datalist');
					hourDatalist.id = 'hourlist';	
					['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'].forEach((item) => {
						let option = document.createElement('option');
						option.value = item;
						
						hourDatalist.appendChild(option);
					});

					let hourLabel = document.createElement('label');
					hourLabel.id = 'hourLabel';
					hourLabel.for = 'hour';
					hourLabel.style = style;

						
					let textNodeHourLabel = document.createTextNode('0 h.');
	
//--------------------------------------------------------------------------------------------------------------
	
//--------------------------------------------------------------------------------------------------------------

					let minuteInput = document.createElement('input');
					minuteInput.id = 'minute';
					minuteInput.type = 'range';
					minuteInput.min = '0';
					minuteInput.max = '59';
					minuteInput.step = '1';
					minuteInput.setAttribute('list', 'minutelist');
					minuteInput.value = '0';
					minuteInput.oninput = () => component.onInputMinute(component);
					minuteInput.onchange = () => component.onChangeMinute(component);
					minuteInput.style = 'margin-left: 25px;';
					
					
					let minuteDatalist = document.createElement('datalist');
					minuteDatalist.id = 'minutelist';	
					['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].forEach((item) => {
						let option = document.createElement('option');
						option.value = item;
						
						minuteDatalist.appendChild(option);
					});

					let minuteLabel = document.createElement('label');
					minuteLabel.id = 'minuteLabel';
					minuteLabel.for = 'minute';
					minuteLabel.style = style;

						
					let textNodeMinuteLabel = document.createTextNode('0 min.');
	
//--------------------------------------------------------------------------------------------------------------

				
		
		let componentTableCell1 = component.shadow.getElementById('componentTableCell1');
			
		componentTableCell1.appendChild(divContentTable);
			divContentTable.appendChild(divContentRow);		
				divContentRow.appendChild(div3a);		
					div3a.appendChild(img1);
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
					
					divConfigCell.appendChild(hourInput);
					divConfigCell.appendChild(hourDatalist);
					divConfigCell.appendChild(hourLabel);
					hourLabel.appendChild(textNodeHourLabel);		

					divConfigCell.appendChild(minuteInput);
					divConfigCell.appendChild(minuteDatalist);
					divConfigCell.appendChild(minuteLabel);
					minuteLabel.appendChild(textNodeMinuteLabel);		
	}


	toggle(component) {
		let item = component.getItem(component.getAttribute('toggle-href'));

		component.httpsClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', null)
		.then(() => {
//		    console.log('ok');
		})
		.catch((error) => {
//		    console.log('error', error);
		});
	}

		
	onInputHour(component) {
		let hourInput = component.shadow.getElementById('hour');
		let hourLabel = component.shadow.getElementById('hourLabel');

		let oldTextNodeLabel = hourLabel.childNodes[0];
		let newTextNodeLabel = document.createTextNode(hourInput.value + ' h.');

		oldTextNodeLabel.parentNode.replaceChild(newTextNodeLabel, oldTextNodeLabel);
	}

		
	onChangeHour(component) {
		let hourInput = component.shadow.getElementById('hour');

        component.alarm.hour = hourInput.value;

		component.writeAlarm(component);
	}


	onInputMinute(component) {
		let minuteInput = component.shadow.getElementById('minute');
		let minuteLabel = component.shadow.getElementById('minuteLabel');

		let oldTextNodeLabel = minuteLabel.childNodes[0];
		let newTextNodeLabel = document.createTextNode(minuteInput.value + ' min.');

		oldTextNodeLabel.parentNode.replaceChild(newTextNodeLabel, oldTextNodeLabel);
	}

		
	onChangeMinute(component) {
		let minuteInput = component.shadow.getElementById('minute');

        component.alarm.minute = minuteInput.value;
        
		component.writeAlarm(component);
	}

	
	writeAlarm(component) {
		let item = component.getItem(component.getAttribute('alarm-href'));

		component.httpsClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', { alarm: component.alarm } );
	}


	getStatus(component) {
		let item = component.getItem(component.getAttribute('status-href'));

		component.httpsClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
		.then((status) => {
			component.setStatus(component, status.status);
			
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true) {
				component.disableComponent(component, []);
				
				component.enabled = false;
			}
		});
	}

	
	getAlarm(component) {
		let item = component.getItem(component.getAttribute('alarm-href'));

		component.httpsClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
		.then((alarm) => {
            component.alarm = alarm.alarm;
            
			component.setAlarm(component, alarm.alarm);
		})
		.catch((error) => {});
	}


	setStatus(component, status) {
		let img1 = component.shadow.getElementById('img1');
		let pTimestamp = component.shadow.getElementById('pTimestamp');

		switch(status) {
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
		
		let pStatus = component.shadow.getElementById('pStatus');
		if(status === true) {
			pStatus.innerHTML = 'on';
		} else {
			pStatus.innerHTML = 'off';
		}

		pTimestamp.innerHTML = '';

		component.enableComponent(component, []);
	}


	setAlarm(component, alarm) {
		let hourInput = component.shadow.getElementById('hour');
		
		hourInput.value = alarm.hour;
		
		
		let hourLabel = component.shadow.getElementById('hourLabel');
		
		let oldTextNodeLabel = hourLabel.childNodes[0];
		let newTextNodeLabel = document.createTextNode(hourInput.value + ' h.');

		oldTextNodeLabel.parentNode.replaceChild(newTextNodeLabel, oldTextNodeLabel);



		let minuteInput = component.shadow.getElementById('minute');
		
		minuteInput.value = alarm.minute;
		
		
		let minuteLabel = component.shadow.getElementById('minuteLabel');
		
		oldTextNodeLabel = minuteLabel.childNodes[0];
		newTextNodeLabel = document.createTextNode(minuteInput.value + ' min.');

		oldTextNodeLabel.parentNode.replaceChild(newTextNodeLabel, oldTextNodeLabel);
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

customElements.define('wc-alarm-light', WCAlarmLight_v1_0_0);
