import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCMovementSensor_v1_0_0 extends WCThingPack1_v1_0_0 {
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
        this.triggerMovementHref = this.getAttribute('triggermovement-href');
        this.movementHref = this.getAttribute('movement-href');

        this.render(this);
        this.enableComponent(this, []);

    }

    render(component, params) {
        super.render(component, params);

        let divContentTable = component.createTable(false, true);
		
			let divContentRow = component.createRow();

				let div3a = component.createLeftContentCell();
		
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

                    let triggerImg = component.createLeftContentImage('');
                    triggerImg.id = 'triggerImg';
                    triggerImg.setAttribute('src', 'http://localhost:38080/web-components/walk-fill-svgrepo-com.svg')
                    triggerImg.style = `height:40px;width:40px;`

                    let triggerBtn = component.createButton('');
                    triggerBtn.id = 'trigger';
                    triggerBtn.style = btnStyle;
                    triggerBtn.onclick = () => {
                        let item = component.getItem(this.triggerMovementHref);
                        this.httpClient.fetch(item.hostname, item.port, item.pathname, 'post', 'application/json', undefined);
                    };

			
				let div3b = component.createCenterContentCell();

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[ ' + component.location + ' ]');

					
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
                        div3a.appendChild(triggerBtn);
                            triggerBtn.appendChild(triggerImg);

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

    config(component, params) {
		component.visible = !component.visible;
		
		if(component.visible === true) {
			component.shadow.getElementById('config').style.display = 'table';
		} else {
			component.shadow.getElementById('config').style.display = 'none';
		}
	}

}

customElements.define('wc-movementsensor', WCMovementSensor_v1_0_0);