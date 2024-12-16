import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCKeyboard_v1_0_0 extends WCThingPack1_v1_0_0 {
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
        this.textHref = this.getAttribute('text-href');
        this.onChangeTextHref = this.getAttribute('onChangeText-href');
        this.sendHref = this.getAttribute('send-href');

        let item = this.getItem(this.onChangeTextHref);

        this.mqttClient.connect(item.hostname, item.port);
		// console.log(item.hostname, item.port)		    

		this.mqttClient.setEvent('connect', (connack) => {
			console.log('--- CONNECT ---')		    
			// console.log(item.pathname)		    

		    this.mqttClient.subscribe(item.pathname)

			this.getText(this);
			setInterval(() => this.getText(this), 10000);

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
			
			this.setText(this, message.text);
		});
		
		
		this.render(this);
        this.getText(this);
        setInterval(() => this.getText(this), 10000);

		this.enableComponent(this, []);

    }

    disconnectedCallback() {
        super.disconnectedCallback();

        let item = this.getItem(this.onChangeTextHref);

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
		
                    let txt = component.createLabel('');
                    txt.id = 'txt1';
			
				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[ Universidad de Almería ]');

					let pStatus = component.createContentValue(component.status);
					pStatus.id = 'pStatus';
						
					let pTimestamp = component.createContentTimestamp(component.timestamp);
					pTimestamp.id = 'pTimestamp';

                    let div3b1 = component.createCenterContentCell();
					

                        let bSend = component.createButton("Send new text");
                        bSend.id = 'bSend';
                        bSend.onclick = () => component.sendText(component);
						
                        let newText = component.createInput("text", null);
                        newText.id = 'newText';
                        newText.style = `width:100px; height:1.5rem; margin: 0 10;`;

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
					div3a.appendChild(txt);
				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
					//div3b.appendChild(pStatus);		
					//div3b.appendChild(pTimestamp);		

				divContentRow.appendChild(div3b1);
                    div3b1.appendChild(bSend);
                    div3b1.appendChild(newText);

				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
                
               
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
    }

    getText(component) {
        let item = component.getItem(component.getAttribute('text-href'));
		
		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
		.then((text) => {

			component.setText(component, text.text);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true) {
				component.disableComponent(component, []);
				
				component.enabled = false;
			}
		});
    }

    setText(component, text) {
        let txt1 = component.shadow.getElementById('txt1');

        txt1.innerHTML = 'Message: ' + text;

        component.enableComponent(component, []);
    }

    sendText(component) {
        let item = component.getItem(component.getAttribute("send-href"));
        let newTxt = component.shadow.getElementById('newText');
        let newT = { "text": newTxt.value };
        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', newT);
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

customElements.define('wc-keyboard', WCKeyboard_v1_0_0);