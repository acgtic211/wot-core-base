import { WCThingPack1_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThingPack1_v1_0_0.js';
import { HTTPClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/MQTTClient_v1_0_0.js';

export class WCAC_2 extends WCThingPack1_v1_0_0 {
    constructor() {
        super();
		this.mqttsClient = new MQTTClient_v1_0_0();
        this.httpsClient = new HTTPClient_v1_0_0();
        this.visible = false;

    }


    async connectedCallback() {
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        this.statusValue = null;
		//Propiedades
		this.temperatureHref = this.getAttribute('temperature-href');
        this.statusHref = this.getAttribute('status-href');
        
		//Eventos
		this.temperatureStatusHref = this.getAttribute('temperaturestatus-href');
        this.acStatusHref = this.getAttribute('acstatus-href');
		
		//Acciones (Creo que sobran)
		this.increaseHref = this.getAttribute('increase-href');
		this.decreaseHref = this.getAttribute('decrease-href');
        this.toggleHref = this.getAttribute('toggle-href');

		
        let temp = this.getItem(this.temperatureStatusHref);
        let status = this.getItem(this.acStatusHref);
		
		//Suscripciones SIN seguridad
        await this.mqttsClient.connect(temp.hostname, temp.port);

        this.mqttsClient.setEvent('connect', (connack) => {
            console.log('Connected to MQTTS');
			
            this.mqttsClient.subscribe(temp.pathname);
            this.mqttsClient.subscribe(status.pathname);

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

			//this.mqttsClient.unsubscribe(item.pathname)
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


        this.render(this);

		this.disableComponent(this, []);
		this.enabled = false;
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.disableComponent(this, []);
        this.enabled = false;

        let item = this.getItem(this.temperatureStatusHref);
        let item2 = this.getItem(this.acStatusHref);

        this.mqttsClient.unsubscribe(item.pathname)
		.then(() => {
			// console.log('unsubscribe 1')		    
            this.mqttsClient.unsubscribe(item2.pathname)
            .catch((error) => {

            })
            .finally(() => {
                this.mqttsClient.disconnect();
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
		
					let statusImg = component.createLeftContentImage('');
					statusImg.id = 'statusImg';
					statusImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/greycircle.svg')
					

				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[ ' + component.location + ' ]');

					let status = component.createContentValue('');
					status.id = 'status1';
						
					let temperature = component.createContentValue('');
                    temperature.id = 'temp1';

			
				let div3e = component.createRightContentCell();
				div3e.onclick = () => component.config(component, []);

					let imgIcoAjustes = component.createRightContentImage('https://acgsaas.ual.es:443/core-repo/web-components/ajustes.jpg');



		let divConfigTable = component.createTable(false, true);
		divConfigTable.id = 'config';
		divConfigTable.style.display = 'none';
		
			let divConfigRow = component.createRow();
		
				let divConfigCell = component.createConfigCell();
						
					let pConfigTitle = component.createConfigTitle('Configuration');

                    let style = '';
					style += 'color: grey;';
					style += 'font-family: arial;';
					style += 'font-size: 10px;';
					style += 'margin: 0px;';
					style += 'padding: 0px;';

					let btnStyle = `
					background-color: #e1ecf4;
					border-radius: 3px;
					border: 1px solid #7aa7c7;
					box-shadow: rgba(255, 255, 255, .7) 0 1px 0 0 inset;
					box-sizing: border-box;
					color: #39739d;
					cursor: pointer;
					display: inline-block;
					font-family: -apple-system,system-ui,"Segoe UI","Liberation Sans",sans-serif;
					font-size: 13px;
					font-weight: 400;
					line-height: 1.15385;
					margin: 10px;
					outline: none;
					padding: 8px .8em;
					position: relative;
					text-align: center;
					text-decoration: none;
					user-select: none;
					-webkit-user-select: none;
					touch-action: manipulation;
					vertical-align: baseline;
					white-space: nowrap;
					width: 85;
					heigth: 80;
					`;

					let toggleImg = component.createLeftContentImage('');
					toggleImg.id = 'toggleImg';
					toggleImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/turn-off-svgrepo-com.svg')
					toggleImg.style = `height:40px;width:40px;`

                    let toggleBtn = component.createButton('');
                    toggleBtn.id = 'toggle';
                    toggleBtn.onclick = () => {
                        let item = component.getItem(component.getAttribute('toggle-href'));
                        this.httpsClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', {"status": !component.statusValue});
                    };
		
					let upImg = component.createLeftContentImage('');
					upImg.id = 'upImg';
					upImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/up-arrow-svgrepo-com.svg')
					upImg.style = `height:40px;width:40px;`

                    let increaseBtn = component.createButton('');
                    increaseBtn.id = 'increase';
                    increaseBtn.onclick = () => {
                        let item = component.getItem(component.getAttribute('increase-href'));
                        this.httpsClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', undefined);
                    };

					let downImg = component.createLeftContentImage('');
					downImg.id = 'downImg';
					downImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/down-arrow-svgrepo-com.svg')
					downImg.style = `height:40px;width:40px;`
					
                    let decreaseBtn = component.createButton('');
                    decreaseBtn.id = 'decrease';
                    decreaseBtn.onclick = () => {
                        let item = component.getItem(component.getAttribute('decrease-href'));
                        this.httpsClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', undefined);
                    };

					toggleBtn.style = btnStyle;
					increaseBtn.style = btnStyle;
					decreaseBtn.style = btnStyle;
					
		
		let componentTableCell1 = component.shadow.getElementById('componentTableCell1');
			
		componentTableCell1.appendChild(divContentTable);
			divContentTable.appendChild(divContentRow);		
				divContentRow.appendChild(div3a);		
					div3a.appendChild(statusImg);
				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
					div3b.appendChild(status);		
					div3b.appendChild(temperature);		
				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);

                    divConfigCell.appendChild(toggleBtn);
					toggleBtn.appendChild(toggleImg);
                    divConfigCell.appendChild(increaseBtn);
					increaseBtn.appendChild(upImg);
                    divConfigCell.appendChild(decreaseBtn);
					decreaseBtn.appendChild(downImg);
    }

    initAC(component) {

		let t = component.getItem(component.getAttribute('temperature-href'));
		let a = component.getItem(component.getAttribute('status-href'));

		//console.log(t, a);

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
		.then((status) => {
            console.log("Set status: ", status);
			component.statusValue = status.status;
			component.setStatus(component, status.status);
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

	setStatus(component, status) {
		let statImg = component.shadow.getElementById('statusImg');
		let lblStatus = component.shadow.getElementById('status1');
		let atxt;
		this.statusValue = status;
		if(status) {
			atxt = 'On';
			statImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/greencircle.svg')

		} else {
			atxt = 'Off';
			statImg.setAttribute('src', 'https://acgsaas.ual.es:443/core-repo/web-components/greycircle.svg')

		}

		lblStatus.innerText = "AC status: " + atxt;

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

customElements.define('wc-ac-2', WCAC_2);