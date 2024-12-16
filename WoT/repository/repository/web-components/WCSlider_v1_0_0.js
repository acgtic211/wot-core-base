import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCSlider_v1_0_0 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();
        this.visible = false;
        this.httpClient = new HTTPClient_v1_0_0();
        this.mqttClient = new MQTTClient_v1_0_0();
    }

    connectedCallback(){
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        this.positionHref = this.getAttribute('position-href');
        this.slideHref = this.getAttribute('slide-href');
        this.onChangePositionHref = this.getAttribute('onChangePosition-href');

        let item = this.getItem(this.onChangePositionHref);
        
        this.mqttClient.connect(item.hostname, item.port);

        this.mqttClient.setEvent('connect', (connack) => {
            console.log('--- CONNECT ---');
            
            this.mqttClient.subscribe(item.pathname);
            this.getPosition(this);
            setInterval(() => this.getPosition(this), 10000);
            
        });

        this.mqttClient.setEvent('close', () => {
			console.log('--- CLOSE ---');
		});

		this.mqttClient.setEvent('end', () => {
			console.log('--- END ---');
		});

		this.mqttClient.setEvent('disconnect', () => {
			console.log('--- DISCONNECT ---');
		});

        this.mqttClient.setEvent('offline', () => {
            console.log('--- OFFLINE ---');
            
            this.disableComponent(this, []);
            this.enabled = false;

            this.mqttClient.disconnect();
        });

        this.mqttClient.setEvent('error', (error) => {
            console.log('--- ERROR ---', error);
        });

        this.mqttClient.setEvent('message', (topic, message, packet) => {
            
            this.setPosition(this, message.position);
        });


        this.render(this);
        this.getPosition(this);
        setInterval(() => this.getPosition(this), 10000);

        this.enableComponent(this, []);
    }

    disconnectedCallback() {
        super.disconnectedCallback();


        let item = this.getItem(this.onChangePositionHref);
       
        this.mqttClient.unsubscribe(item.pathname)
        .then(() => {
            console.log('Unsubscribed changedPosition event');
            
        })
        .catch((error) => {
            console.log('Unsubscribe Changed position event error', error);
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
		
                    params = {
                        min: 0,
                        max: 100
                    };

					let slider = component.createInput("range", params);
                    slider.id = 'slider';

                    //slider.onchange = this.onChangeSlider(component);
                    slider.addEventListener('change', () => this.onChangeSlider(component));
                    
                    let lblPos = component.createLabel('Position: ');
                    lblPos.id = 'lblPos';
			
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
					div3a.appendChild(lblPos);
                    div3a.appendChild(slider);
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

    onChangeSlider(component){
        let item = component.getItem(component.getAttribute('slide-href'));
        let slider = component.shadow.getElementById('slider');
        
        let newPos = { "position": parseInt(slider.value)};
        console.log(newPos);
        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', newPos);
        this.getPosition(component);
    }

    getPosition(component) {
        let item = component.getItem(component.getAttribute('position-href'));

        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((position) => {
            
            component.setPosition(component, position.position);
            component.enabled = true;
        })
        .catch((error) => {
            if(component.enabled === true){
                component.disableComponent(component, []);
                component.enabled = false;
            }
        });
    }

    setPosition(component, position) {

        let pTimestamp = component.shadow.getElementById('pTimestamp');
        let lblPos = component.shadow.getElementById('lblPos');
        lblPos.innerText = "Position: " + position;

        let slider = component.shadow.getElementById('slider');
        slider.value = position;
		
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

customElements.define('wc-slider', WCSlider_v1_0_0);