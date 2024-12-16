export class WCThing_v1_0_0 extends HTMLElement {
	constructor() {
		super();
		
		this.shadow = this.attachShadow( { mode: 'open' } );
		this.style = '* { margin: 0px !important }';
		this.innerHTML = '<style>* { margin: 0px !important; overflow: hidden !important; }</style';
	}

	getItem(item) {
		let name = item.name;
		let url = new URL(item);
		let protocol = url.protocol.substring(0, url.protocol.length-1).toUpperCase();
		/*console.log({
			"item": item,
			"name": name,
			"url": url,
			"protocol": protocol
		});*/
		url = new URL('http://' + item.substring(url.protocol.length+1, item.length));
		
		let hostname = url.hostname;
		let port = ((url.port === null) || (url.port === '')) ? 80 : url.port;
		let pathname = url.pathname;
		
		switch(protocol) {
			case 'HTTP':	
			case 'COAP':	
			    pathname = url.pathname;
			    break;

			case 'MQTT':	
                pathname = url.pathname.substring(1, url.pathname.length);
                if(item.charAt(item.length-1) === '#') {
                    pathname = pathname + '#';
                }
			    break;

			case 'MQTTS':
				pathname = url.pathname.substring(1, url.pathname.length);
				
				break;
		}

		let method = null;
		let contentType = 'application/json';
		
		return ({
			name: name,
			protocol: protocol,
			hostname: hostname,
			port: port,
			pathname: pathname,
			method: method,
			contentType: contentType
		});
	}
}
