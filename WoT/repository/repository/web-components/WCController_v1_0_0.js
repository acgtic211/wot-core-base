import { WCThingPack1_v1_0_0 } from 'http://localhost:38080/web-components/WCThingPack1_v1_0_0.js';

import { HTTPClient_v1_0_0 } from 'http://localhost:38080/web-components/HTTPClient_v1_0_0.js';
import { MQTTClient_v1_0_0 } from 'http://localhost:38080/web-components/MQTTClient_v1_0_0.js';

export class WCController_v1_0_0 extends WCThingPack1_v1_0_0 {
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
		this.onChangeStateHref = this.getAttribute('onChangeState-href');

		this.toggleHref = this.getAttribute('toggle-href');
		this.stateHref = this.getAttribute('state-href');
		this.changeStateHref = this.getAttribute('changestate-href');
		
		let item = this.getItem(this.onChangeStateHref);

		this.mqttClient.connect(item.hostname, item.port);

		this.mqttClient.setEvent('connect', (connack) => this.mqttClient.subscribe(item.pathname));

		this.mqttClient.setEvent('message', (topic, message, packet) => {
			let state = JSON.parse(message);

			this.setstate(this, state.state);
		});
		
		this.mqttClient.setEvent('offline', () => this.mqttClient.unsubscribe(item.pathname));

		this.render(this);
		
		this.getState(this);
		setInterval(() => this.getState(this), 30000);

		this.enableComponent(this, []);
	}
	
	disconnectedCallback() {
		super.disconnectedCallback();
		
		
		let item = this.getItem(this.onChangestateHref);

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
				div3a.onclick = () => component.toggle(component);
				
					let img1 = component.createLeftContentImage('');
					img1.id = 'img1';
					img1.setAttribute('src', 'http://localhost:38080/web-components/cyberscooty-switch-off.svg');
			
				let div3b = component.createCenterContentCell();
				div3b.style.cursor = 'pointer';

					let p0 = component.createContentIdentifier(component.identifier);

					let pPlace = component.createContentLocation('[' + component.location + ']');

					let pTimestamp = component.createContentTimestamp(component.timestamp);
					pTimestamp.id = 'pTimestamp';
			
					let div3b1 = component.createCenterContentCell();

                        let bChange = component.createButton("Change");
                        bChange.id = "bChange";
                        bChange.onclick = () => component.changeState(component);
						bChange.style = `
							padding: 10px;
							border-radius: 8px;
						`;

                        let inputHueParams = {
                            min: 0,
                            max: 65535
                        };

                        let briParams = {
                            min: 0,
                            max: 254
                        };

                        let effectOptions = [ {text: "None", value: "none" }, {text: "Color loop", value: "colorloop"} ];
                        let alertOptions = [ {text: "None", value: "none"}, { text: "One breath cycle", value: "select"} , { text: "Breath", value: "lselect"}];

                        

                        let divBri = component.createCenterContentCell();
                        let lBri = component.createLabel("Brightness: ");
                        let iBri = component.createInput("range", briParams);
                        divBri.appendChild(lBri);
                        divBri.appendChild(iBri);
                        lBri.id = "lBri";
                        iBri.id = "iBri";

                        let divEffect = component.createCenterContentCell();
                        let lEffect = component.createLabel("Effect:");
                        let sEffect = component.createSelect(effectOptions);
                        sEffect.id = "sEffect";
                        divEffect.appendChild(lEffect);
                        divEffect.appendChild(sEffect);

                        let divAlert = component.createCenterContentCell();
                        let lAlert = component.createLabel("Alert:");
                        let sAlert = component.createSelect(alertOptions);
                        sAlert.id = "sAlert";
                        divAlert.appendChild(lAlert);
                        divAlert.appendChild(sAlert);

                        let satParams = {
                            min: 0,
                            max: 254
                        };

                        
						let divCM = component.createCenterContentCell();
						divCM.id = "divCM";
						let cmParams = [ { text: "Hue & Sat", value: "hs" } , { text: "XY", value: "xy" }, { text: "CT", value: "ct" } ]; 
						let sColormode = component.createSelect(cmParams);
						sColormode.id = "sColormode";
						let lCM = component.createLabel("Colormode: ");
						lCM.id = "lCM";
						divCM.appendChild(lCM);
						divCM.appendChild(sColormode);

						//Colormode = xy
						let divXY = component.createCenterContentCell();
						let divX = component.createCenterContentCell();
						let divY = component.createCenterContentCell();
						let cieImg = component.createLeftContentImage('');
						cieImg.setAttribute('src', 'http://localhost:38080/web-components/cieColor.png');
						cieImg.style = `
							width: 300px;
							height: 300px;
							float: right;
						`;
						divXY.id = "divXY";
						divX.id = "divX";
						divY.id = "divY";
						let lX = component.createLabel("x: ");
						lX.id = "lX";
						let lY = component.createLabel("y: ");
						lY.id = "lY";
						let xyParams = {
							min: 0,
							max: 1
						};

						let x = component.createInput("range", xyParams);
						x.setAttribute('step', 0.0001);
						x.style = `
							width: 300px;
							height: 10px;
						`;
						x.id = "iX";
						let y = component.createInput("range", xyParams);
						y.setAttribute('step', 0.0001);
						y.style = `
							width: 10px;
							height: 280px;
							-webkit-appearance: slider-vertical;
							float: left;
						`;
						y.id = "iY";
						divXY.appendChild(divY);
							//divY.appendChild(lY);
							divY.appendChild(y);
							divY.appendChild(cieImg);
						divXY.appendChild(divX);
							//divX.appendChild(lX);
							divX.style = `
								float: left;
								margin-left: 45px;
							`;
							divX.appendChild(x);
						

						divXY.style.display = "none";

						//Colormode = ct
						let divCT = component.createCenterContentCell();
						divCT.id = "divCT";
						let ctParams = {
							min: 153,
							max: 500
						};
						let iCT = component.createInput("range", ctParams);
						iCT.id = "iCT";
						let lCT = component.createLabel("ct: ");
						lCT.id = "lCT";
						divCT.appendChild(lCT);
						divCT.appendChild(iCT);
						divCT.style.display = "none";

						//Colormode = hs
						let divHS = component.createCenterContentCell();
						divHS.id = "divHS";
						let divHue = component.createCenterContentCell();
                        let lHue = component.createLabel("HUE:");
                        let iHue = component.createInput("number", inputHueParams);
                        
                        divHue.appendChild(lHue);
                        divHue.appendChild(iHue);
                        iHue.id = "iHue";

						let divSat = component.createCenterContentCell();
                        let lSat = component.createLabel("Saturation: ");
                        let iSat = component.createInput("range", satParams);
                        divSat.appendChild(lSat);
                        divSat.appendChild(iSat);
                        lSat.id = "lSat";
                        iSat.id = "iSat";

						divHS.appendChild(divHue);
						divHS.appendChild(divSat);
						divHS.style.display = "none";

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

		divCM.style.display = "none";
		
		let componentTableCell1 = component.shadow.getElementById('componentTableCell1');
			
		componentTableCell1.appendChild(divContentTable);
			divContentTable.appendChild(divContentRow);		
				divContentRow.appendChild(div3a);		
					div3a.appendChild(img1);
				divContentRow.appendChild(div3b);		
					div3b.appendChild(p0);		
					div3b.appendChild(pPlace);		
//					div3b.appendChild(pstate);		
					div3b.appendChild(pTimestamp);

				divContentRow.appendChild(div3b1);	
					div3b1.appendChild(bChange);
					div3b1.appendChild(divEffect);
					div3b1.appendChild(divAlert);
					div3b1.appendChild(divBri);
					div3b1.appendChild(divCM);
					div3b1.appendChild(divXY);
					div3b1.appendChild(divCT);
					div3b1.appendChild(divHS);

				divContentRow.appendChild(div3e);		
					div3e.appendChild(imgIcoAjustes);
					
		componentTableCell1.appendChild(divConfigTable);
			divConfigTable.appendChild(divConfigRow);		
				divConfigRow.appendChild(divConfigCell);		
					divConfigCell.appendChild(pConfigTitle);
					divConfigCell.appendChild(pConfigText);
	}



	getState(component) {
		let item = component.getItem(component.getAttribute('state-href'));

		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
		.then((props) => {			
			component.setState(component, props.state);
			component.enabled = true;
		})
		.catch((error) => {
			if(component.enabled === true) {
				component.disableComponent(component, []);
				component.enabled = false;
			}
		});
	}


	setState(component, state) {
		let img1 = component.shadow.getElementById('img1');
		let pTimestamp = component.shadow.getElementById('pTimestamp');

		console.log(state);
		switch(state.on) {
			case true:
				img1.setAttribute('src', 'http://localhost:38080/web-components/cyberscooty-switch-on.svg');
				break;
				
			case false:
				img1.setAttribute('src', 'http://localhost:38080/web-components/cyberscooty-switch-off.svg');
				break;
				
			default:
				img1.setAttribute('src', '');
				break;
		}

		let iHue = component.shadow.getElementById('iHue');
        iHue.value = state.hue;

        let iBri = component.shadow.getElementById('iBri');
        iBri.value = state.bri;

        let iSat = component.shadow.getElementById('iSat');
        iSat.value = state.sat;

        let lBri = component.shadow.getElementById('lBri');
        lBri.innerText = "Brightness: " + state.bri;
        let lSat = component.shadow.getElementById('lSat');
        lSat.innerText = "Saturation: " + state.sat;
        
        let sAlert = component.shadow.getElementById('sAlert');
        
        switch(state.alert){
            case "none":
                sAlert.options.selectedIndex = 0;
                break;
            
            case "select":
                sAlert.options.selectedIndex = 1;
                break;

            case "lselect":
                sAlert.options.selectedIndex = 2;
                break;
            
            default:
                sAlert.options.selectedIndex = 0;
                break;
        }

        let sEffect = component.shadow.getElementById('sEffect');
        
        switch(state.effect){
            case "none":
                sEffect.options.selectedIndex = 0;
                break;
            
            case "colorloop":
                sEffect.options.selectedIndex = 1;
                break;

            default:
                sEffect.options.selectedIndex = 0;
                break;
        }

		let divHS = component.shadow.getElementById('divHS');
		let divXY = component.shadow.getElementById('divXY');
		let divCT = component.shadow.getElementById('divCT');
		let sCM = component.shadow.getElementById('sColormode');
		//console.log(state.colormode);
		switch(state.colormode){
			case "hs":
				divHS.style.display = "table-cell";
				divXY.style.display = "none";
				divCT.style.display = "none";
				sCM.options.selectedIndex = 0;
				break;
			
			case "xy":
				divHS.style.display = "none";
				divXY.style.display = "table-cell";
				divCT.style.display = "none";
				sCM.options.selectedIndex = 1;
				break;
			
			case "ct":
				divHS.style.display = "none";
				divXY.style.display = "none";
				divCT.style.display = "table-cell";
				sCM.options.selectedIndex = 2;
				break;

			default:
				divHS.style.display = "none";
				divXY.style.display = "none";
				divCT.style.display = "none";
				break;
		}

		let x = component.shadow.getElementById('iX');
		x.value = state.xy[0];
		let y = component.shadow.getElementById('iY');
		y.value = state.xy[1];
		
		let ct = component.shadow.getElementById('iCT');
		let lCT = component.shadow.getElementById('lCT');
		lCT.innerText = "CT: " + state.ct;
		ct.value = state.ct;


		if(state.timestamp !== undefined)
		{
			let pTimestamp = component.shadow.getElementById('pTimestamp');
			let d = new Date(state.timestamp);
			
			pTimestamp.innerHTML = '';
			pTimestamp.innerHTML += d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
			pTimestamp.innerHTML += '&nbsp;&nbsp;&nbsp;';
			pTimestamp.innerHTML += d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth()+1).toString().padStart(2, '0') + '/' + d.getFullYear();
		}
		
		component.enableComponent(component, []);
	}

	changeState(component){
		
		let item = component.getItem(component.getAttribute('state-href'));
		let bri = parseInt(component.shadow.getElementById('iBri').value);
		let sat = parseInt(component.shadow.getElementById('iSat').value);
		let x = parseFloat(component.shadow.getElementById('iX').value);
		let y = parseFloat(component.shadow.getElementById('iY').value);
		let xy = [ x, y];
		let ct = parseInt(component.shadow.getElementById('iCT').value);
		let effectA = component.shadow.getElementById('sEffect').options.selectedIndex;
		let effect = component.shadow.getElementById('sEffect').options[effectA].value;
		let alertA = component.shadow.getElementById('sAlert').options.selectedIndex;
		let alert = component.shadow.getElementById('sAlert').options[alertA].value;
		let cmA = component.shadow.getElementById('sColormode').options.selectedIndex;
		let colormode = component.shadow.getElementById('sColormode').options[cmA].value;
		let hue = parseInt(component.shadow.getElementById('iHue').value);

		/*
		Este state tiene colormode, propiedad que en un principio podiamos cambiar, pero era una mentira de la burguesia.
		let newState = {
			"bri": bri,
			"sat": sat,
			"xy": xy,
			"ct": ct,
			"alert": alert,
			"hue": hue,
			"effect": effect,
			"colormode": colormode
		}*/

		let newState = {
			"bri": bri,
			"sat": sat,
			"xy": xy,
			"ct": ct,
			"alert": alert,
			"hue": hue,
			"effect": effect
		}

		//console.log(newState);

		component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((props) => {
            let cs = component.getItem(component.getAttribute('changestate-href'));
            component.httpClient.fetch(cs.hostname, cs.port, cs.pathname, 'put', 'application/json', newState);
			this.getState(component, props.state);
        })
        .catch((error) => {
            console.log("Error changing state");
        });
	}

	toggle(component){
        
        let item = component.getItem(component.getAttribute('state-href'));
        component.httpClient.fetch(item.hostname, item.port, item.pathname, 'get', 'application/json', null)
        .then((props) => {
            let toggle = component.getItem(component.getAttribute('toggle-href'));
            component.httpClient.fetch(toggle.hostname, toggle.port, toggle.pathname, 'put', 'application/json', {"on":!props.state.on});
			this.getState(component, props.state);
        })
        .catch((error) => {
            console.log("Error toggle");
        });
        
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

customElements.define('wc-controller', WCController_v1_0_0);
