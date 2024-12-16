import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';
import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCButton_v1_0_0 extends WCThingPack1_v1_0_0 {
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

        this.sendMessageHref = this.getAttribute('sendMessage-href');

        this.msgReceivedHref = this.getAttribute('messageReceived-href');

        let msg = this.getItem(this.msgReceivedHref);

        this.mqttClient.connect(msg.hostname, '9001');

        this.mqttClient.setEvent('connect', (connack) => {
            console.log("Connected to MQTT");

            this.mqttClient.subscribe(msg.pathname);

            this.initButton(this);
            setInterval(() => this.initButton(this), 10000);
        });

        this.mqttClient.setEvent('close', () => {
            console.log("Connection closed");
        });

        this.mqttClient.setEvent('end', () => {
            console.log("Connection ended");
        });

        this.mqttClient.setEvent('disconnect', () => {
            console.log("Client disconnected");
        });

        this.mqttClient.setEvent('offline', () => {
            console.log("--- OFFLINE ---");

            this.disableComponent(this, []);
            this.enabled = false;
            this.mqttClient.disconnect();
        });

        this.mqttClient.setEvent('error', (error) => {
            console.log('--- MQTT Message ---');
            console.log(message);
            console.log('--------------------');
            this.initButton(this);
        });

        this.render(this);

        this.disableComponent(this, []);
        this.enabled = false;

    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;

        let item = this.getItem(this.textHref);

        this.mqttClient.unsubscribe(item.pathname)
        .finally(() => {
            this.mqttClient.disconnect();
        })
        .catch((error) => {
            console.log(error);
        });
    }

    render(component, params) {
        super.render(component, params);

        let divContentTable = component.createTable(false, true);
		
			let divContentRow = component.createRow();

				let div3a = component.createLeftContentCell();

					let text = component.createLabel('');
					text.id = 'text1';

                    let button = component.createButton('It does nothing');
                    button.id = 'button1';

                    button.onclick = () => {
                        let sendMessage = component.getItem(this.getAttribute('sendMessage-href'));
                        this.httpClient.fetch(sendMessage.hostname, sendMessage.port, sendMessage.pathname, 'post', 'application/json', undefined);
                        console.log("boton");
                    }

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
					div3a.appendChild(text);
                    div3a.appendChild(button);
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

    initButton(component) {
        let t = component.getItem(component.getAttribute('text-href'));
        
        component.httpClient.fetch(t.hostname, t.port, t.pathname, 'get', 'application/json', null)
        .then((text) => {
            component.setText(component, text.text);
            component.enabled = true;
        })
        .catch((error) => {
            if(component.enabled){
                component.disableComponent(component, []);
                component.enabled = false;
            }
        });
    }

    setText(component, text){
        let lbl = component.shadow.getElementById('text1');
        lbl.innerText = "Text: " + text;

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

customElements.define('wc-button', WCButton_v1_0_0);