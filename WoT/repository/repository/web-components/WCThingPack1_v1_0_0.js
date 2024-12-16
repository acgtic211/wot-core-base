import 'https://unpkg.com/mqtt/dist/mqtt.min.js';
const MQTT = mqtt;

import { WCThing_v1_0_0 } from 'https://acgsaas.ual.es:443/core-repo/web-components/WCThing_v1_0_0.js';

export class WCThingPack1_v1_0_0 extends WCThing_v1_0_0 {
	constructor() {
		super();
		
		this.enabled = false;
	}
	
	connectedCallback() {
	}
	
	disconnectedCallback() {
	}
	
	
	render(component, params) {
		
		let componentTable = component.createTable(true, false);
		
			let componentTableRow1 = component.createRow();
			componentTableRow1.id = 'componentTableRow1';
			componentTableRow1.style.display = 'none';
			
				let componentTableCell1 = component.createCell();
				componentTableCell1.id = 'componentTableCell1';
				
			let componentTableRow2 = component.createRow();
			componentTableRow2.id = 'componentTableRow2';
			
				let componentTableCell2 = component.createConnectingCell();
				componentTableCell2.id = 'componentTableCell2';
				
					let divConnectingText = component.createConnectingText('Connecting...');

		

		component.shadow.appendChild(componentTable);
		
			componentTable.appendChild(componentTableRow1);
			
				componentTableRow1.appendChild(componentTableCell1);
				
			componentTable.appendChild(componentTableRow2);
			
				componentTableRow2.appendChild(componentTableCell2);
				
					componentTableCell2.appendChild(divConnectingText);		
		
		
	}
	
	
	createTable(border, spacing) {
		let style = '';
		style += 'background-color: white;';
		style += (border === true) ? 'border: 2px solid grey;' : 'border: 0px;';
		style += 'border-radius: 6px;';
		style += 'border-collapse: separate;';
		style += (spacing === true) ? 'border-spacing: 5px;' : 'border-spacing: 0px;';
		style += 'box-sizing: border-box;';
		style += 'display: table;';
		style += 'width: 100%;';
		style += 'overflow: hidden;';
		style += 'height: 90px';
		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createRow() {
		let style = '';
		style += 'display: table-row;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createCell() {
		let style = '';
		style += 'display: table-cell;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	
	createConnectingCell() {
		let style = '';
// style += 'border: 1px solid red;';
style += 'border-radius: 4px;';
		style += 'background-color: lightgrey;';
		style += 'display: table-cell;';
		style += 'margin: 0px;';
		style += 'padding: 20px;';
		style += 'text-align: center;';
		style += 'vertical-align: middle;';
		
		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createConnectingText(text) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 14px;';
		style += 'margin: 0px;';
		style += 'padding: 0px;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(text);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	
	createLeftContentCell() {
		let style = '';
		style += 'background-color: white;';
		style += 'border: 0px solid red;';
		style += 'border-right: 1px solid grey;';
		style += 'box-sizing: border-box;';
		style += 'display: table-cell;';
		style += 'padding-left: 5px;';
		style += 'padding-right: 10px;';
		style += 'text-align: center;';
		style += 'vertical-align: middle;';
		style += 'width: 60px;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createCenterContentCell() {
		let style = '';
		style += 'background-color: white;';
		style += 'border: 0px solid red;';
		style += 'box-sizing: border-box;';
		style += 'display: table-cell;';
		style += 'padding-left: 10px;';
		style += 'padding-right: 10px;';
		style += 'text-align: left;';
		style += 'vertical-align: middle;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createRightContentCell() {
		let style = '';
		style += 'background-color: white;';
		style += 'border: 0px solid red;';
		style += 'border-left: 1px solid grey;';
		style += 'box-sizing: border-box;';
		style += 'display: table-cell;';
		style += 'vertical-align: middle;';
		style += 'text-align: center;';
		style += 'padding-left: 10px;';
		style += 'padding-right: 5px;';
		style += 'width: 20px;';
		style += 'cursor: pointer;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}

	
	createLeftContentImage(src) {
		let style = '';
		style += 'border: 0px solid red;';
		style += 'height: 60px;';
		style += 'width: 60px;';
		
		let img = document.createElement('img');
		img.src = src;
		img.style = style;
		
		return(img);
	}
	
	createContentIdentifier(id) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 16px;';
		style += 'font-weight: bold;';
		style += 'margin: 0px;';
		style += 'padding: 0px;';
		style += 'text-align: left;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(id);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	createContentLocation(location) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 14px;';
		style += 'margin: 0px;';
		style += 'padding: 0px;';
		style += 'text-align: left;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(location);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	createContentValue(value) {
		let style = '';
		style += 'color: orange;';
		style += 'font-family: arial;';
		style += 'font-size: 18px;';
		style += 'font-weight: bold;';
		style += 'margin: 0px;';
		style += 'padding-top: 5px;';
		style += 'text-align: left;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(value);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	createContentTimestamp(value) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 12px;';
		style += 'margin: 0px;';
		style += 'padding: 0px;';
		style += 'text-align: left;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(value);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	createRightContentImage(src) {
		let style = '';
		style += 'border: 0px solid red;';
		style += 'height: 20px;';
		style += 'width: 20px;';
		
		let img = document.createElement('img');
		img.src = src;
		img.style = style;
		
		return(img);
	}
	
	
	createConfigCell() {
		let style = '';
		style += 'background-color: white;';
		style += 'border: 0px solid grey;';
		style += 'border-top: 1px solid grey;';
		style += 'box-sizing: border-box;';
		style += 'display: table-cell;';
		style += 'padding-top: 5px;';
		style += 'padding-bottom: 5px;';
		style += 'text-align: left;';
		style += 'vertical-align: middle;';

		let div = document.createElement('div');
		div.style = style;
		
		return(div);
	}
	
	createConfigTitle(title) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 14px;';
		style += 'margin: 0px;';
		style += 'padding-top: 5px;';
		style += 'padding-left: 10px;';
		style += 'padding-right: 10px;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(title);

		
		p.appendChild(textNode);		

		
		return(p);
	}
	
	createConfigText(text) {
		let style = '';
		style += 'color: grey;';
		style += 'font-family: arial;';
		style += 'font-size: 12px;';
		style += 'margin: 0px;';
		style += 'padding-left: 10px;';
		style += 'padding-right: 10px;';
		style += 'padding-top: 10px;';
		
		let p = document.createElement('p');
		p.style = style;
		
		let textNode = document.createTextNode(text);

		
		p.appendChild(textNode);		

		
		return(p);
	}

	
	enableComponent(component, params) {
		let componentTableRow1 = component.shadow.getElementById('componentTableRow1');
		let componentTableRow2 = component.shadow.getElementById('componentTableRow2');

		componentTableRow2.style.display = 'none';
		componentTableRow1.style.display = 'table-row';
	}

	disableComponent(component, params) {
		let componentTableRow1 = component.shadow.getElementById('componentTableRow1');
		let componentTableRow2 = component.shadow.getElementById('componentTableRow2');

		componentTableRow1.style.display = 'none';
		componentTableRow2.style.display = 'table-row';
	}

	createButton(text){
		let b = document.createElement('button');
		b.innerText = text;
		return b;
	}

	createInput(type, params){
		let i = document.createElement('input');
		switch(type){
			case "number":

				i.type = "number";
				i.min = params.min;
				i.max = params.max

				break;

			case "range":

				i.type = "range";
				i.min = params.min;
				i.max = params.max;
				
				break;

			case "text":
				i.type = "text";
				break;
			default:
				break;
		}

		return i;
	}

	createSelect(options){
		var s = document.createElement('select');

		for(var i in options){
			let o = document.createElement('option');
			o.innerText = options[i].text;
			o.value = options[i].value;
			s.appendChild(o);
		}

		return s;
	}
	
	createLabel(text){
		let l = document.createElement('label');
		l.innerText = text;
		return l;
	}


}
