import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCColorLight_v1_0_0 extends WCThingPack1_v1_0_0 {
    constructor(){
        super();
        this.visible = false;
        this.httpClient = new HTTPClient_v1_0_0();
        this.mqttClient = new MQTTClient_v1_0_0();
        
    }

    connectedCallback(){
        super.connectedCallback();

        this.identifier = this.getAttribute('identifier');
        this.location = this.getAttribute('location');
        this.propsHref = this.getAttribute('props-href');
        this.onChangeStateHref = this.getAttribute('onchangestate-href');

        

        this.render(this);

        this.getStateOn(this);
        setInterval(() => this.getStateOn(this), 5000);

        this.enableComponent(this, []);

    }

    disconnectedCallback(){
        super.disconnectedCallback();
    }

    render(component, params){
        super.render(component, params);

        
        let divContentTable = component.createTable(false, true);
            let divContentRow = component.createRow();
                let div3a = component.createLeftContentCell();
                    let img1 = component.createLeftContentImage('');
                    img1.id = 'img1';
                    let img2 = component.createCenterContentCell();
                    img2.id = 'img2';
                let div3b = component.createCenterContentCell();
                    let p0 = component.createContentIdentifier(component.identifier);
                    let pPlace = component.createContentLocation('['+component.location+']');
                    let pStatus = component.createContentValue(component.status);
                    pStatus.id = 'pStatus';

                    let pTimestamp = component.createContentTimestamp(component.timestamp);
                    pTimestamp.id = 'pTimestamp';
                    
                let div3e = component.createRightContentCell();
                div3e.onClick = () => component.config(component, []);

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
                                    div3a.appendChild(img1);
                                    div3a.appendChild(img2);
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

    getStateOn(component){
        let item = component.getItem(component.getAttribute('state-href'));

        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((props) => {
            component.setState(component, props.state);

            component.enabled = true;
        })
        .catch((error) => {
            if(component.enabled === true){
                component.disableComponent(component, []);

                component.enabled = false;
            }
        });
    }

    setState(component, state){
        let img1 = component.shadow.getElementById('img1');
        let img2 = component.shadow.getElementById('img2');
        let rgb = this.cie_to_rgb(state.xy[0], state.xy[1], state.bri);

        img2.style = `
            width: 25px;
            height: 25px;
            margin: 5px auto;
            border-radius: 50%;
        `;

        let color = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
        console.log(color);
        img2.style.backgroundColor = color;
        
        let pTimestamp = component.shadow.getElementById('pTimestamp');
        console.log(state);
        switch(state.on){
            case true:
                img1.setAttribute('src', 'http://localhost:38080/web-components/afaulconbridge-Lightbulb-OnOff-1.svg');
				break;
				
			case false:
				img1.setAttribute('src', 'http://localhost:38080/web-components/afaulconbridge-Lightbulb-OnOff-2.svg');
				break;
				
			default:
				img1.setAttribute('src', '');
				break;
        }

        
        
       

        

        if(state.timestamp !== undefined){
            let pTimestamp = component.shadow.getElementById('pTimestamp');
            let d = new Date(state.timestamp);

            pTimestamp.innerHTML = '';
			pTimestamp.innerHTML += d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
			pTimestamp.innerHTML += '&nbsp;&nbsp;&nbsp;';
			pTimestamp.innerHTML += d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth()+1).toString().padStart(2, '0') + '/' + d.getFullYear();
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


    //Source: https://github.com/usolved/cie-rgb-converter/blob/master/cie_rgb_converter.js
    cie_to_rgb(x, y, brightness){
	//Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
	if (brightness === undefined) {
		brightness = 254;
	}

	var z = 1.0 - x - y;
	var Y = (brightness / 254).toFixed(2);
	var X = (Y / y) * x;
	var Z = (Y / y) * z;

	//Convert to RGB using Wide RGB D65 conversion
	var red 	=  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
	var green 	= -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
	var blue 	=  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

	//If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
	if (red > blue && red > green && red > 1.0) {

		green = green / red;
		blue = blue / red;
		red = 1.0;
	}
	else if (green > blue && green > red && green > 1.0) {

		red = red / green;
		blue = blue / green;
		green = 1.0;
	}
	else if (blue > red && blue > green && blue > 1.0) {

		red = red / blue;
		green = green / blue;
		blue = 1.0;
	}

	//Reverse gamma correction
	red 	= red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
	green 	= green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
	blue 	= blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;


	//Convert normalized decimal to decimal
	red 	= Math.round(red * 255);
	green 	= Math.round(green * 255);
	blue 	= Math.round(blue * 255);

	if (isNaN(red))
		red = 0;

	if (isNaN(green))
		green = 0;

	if (isNaN(blue))
		blue = 0;


	return [red, green, blue];
}

    

}

customElements.define('wc-colorlight', WCColorLight_v1_0_0);