import { ReadableStream } from './ReadableStream.js';

export class InteractionOutput {
	constructor(data, dataUsed, form, schema) {
		this.data = undefined;
		this.dataUsed = undefined;
		this.form = undefined;
		this.schema = undefined;
		
		this._value = undefined;

		this.data = data;
		this.dataUsed = dataUsed;
		this.form = form;
		this.schema = schema;
	}
	
	arrayBuffer() {
		return new Promise((resolve, reject) => {
			if(
				// (typeof this.data !== 'ReadableStream') ||
				(this.dataUsed === true)
			) {
				reject(new Error('NotReadableError'));
			} else {
				// let reader = the result of getting a reader from data
				// let bytes = the result of reading all bytes from data with reader
				
				this.dataUsed = true;
				
				try {
					let arrayBuffer = new ArrayBuffer(bytes);
					
					resolve(arrayBuffer);
				} catch(error) {
					reject(error);
				}
			}
		});
	}
	
	value() {
		// console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')	    
		return new Promise((resolve, reject) => {
			if(this._value !== undefined) {
				resolve(this._value);
			} else {
				/*console.log('--------------------------------------')				    
				console.log('data', this.data)
				console.log('dataUsed', this.dataUsed)
				console.log('form', this.form)
				console.log('schema', this.schema)
				console.log('--------------------------------------')*/
				if(
					// (typeof this.data !== 'ReadableStream') ||
					(this.dataUsed === true) ||
					(this.form === null) ||
					(this.schema === null) ||
					(this.schema === undefined) ||
					(this.schema.type === null) ||
					(this.schema.type === undefined)
				) {
					reject(new Error('NotReadableError'));
					
				} else {
					// if(
						// (this.form.contentType !== 'application/json') // &&
						// (mapping is not available in the Protocol Bindings)
					// ) {
						// reject(new NotSupportedError('NotSupportedError'));
					// } else {
						// let reader = the result of getting a reader from data
						// let bytes = the result of reading all bytes from data with reader
						
						this.dataUsed = true;
						
						if(
							(this.form.contentType !== 'application/json') // &&
							// (mapping is available in the Protocol Bindings)
						) {
							// transform bytes with that mapping
							
							try {
								// let json = JSON.parse(bytes);
								let json = this.data;

								// this._value = checkDataSchema(json, this.schema);
								
								this._value = checkDataSchema(json, this.schema);

								resolve(this._value);
							} catch(error) {
								reject(error);
							}
						} else {
							try {
								/*console.log("#######################################");
								console.log('data', this.data)
								console.log('schema', this.schema)
								console.log("#######################################");*/

                                this._value = checkDataSchema(this.data, this.schema);
								//console.log("this._value: ", this._value);
								resolve(this._value);
							} catch(error) {
								reject(error);
							}
						}
					// }
				}
			}
		});
	}
}

function checkDataSchema(payload, schema) {
    // para eliminar los item null
	//Aqui se carga los false del array
    Object.keys(payload).forEach(k => (payload[k] === null && payload[k] !== undefined) && delete payload[k]);    
	//console.log('typeof', payload, typeof payload, schema)		    
	
	let type = schema.type;
	switch(type) {
		case null:
			if(payload !== null) {
				throw new TypeError('TypeError')
			} else {
				return(null);
			}
			
		case 'boolean':
			if(
				(payload === false) ||
				(payload.length === 0)
			) {
				return(false);
			} else {
					
				return(true);
			}
			
		case 'integer':
			
			if(typeof payload !== 'number') {
				throw new TypeError('TypeError');
			} else {
				if(
					((schema.minimum !== undefined) && (payload < schema.minimum)) ||
					((schema.maximum !== undefined) && (payload > schema.maximum))
				) {
					throw new RangeError('RangeError');
				}
			}
			break;

		case 'number':
			
			if(typeof payload !== 'number') {
				throw new TypeError('TypeError');
			} else {
				if(
					((schema.minimum !== undefined) && (payload < schema.minimum)) ||
					((schema.maximum !== undefined) && (payload > schema.maximum))
				) {
					throw new RangeError('RangeError');
				}
			}
			break;
			
		case 'string':
			return(payload);

		case 'array':

			if((payload instanceof Array) === false) {
				throw new TypeError('TypeError');
			} else {
				if(
					((schema.minItems !== undefined) && (payload.length < schema.minItems)) ||
					((schema.maxItems !== undefined) && (payload.length > schema.maxItems))
				) {
					throw new RangeError('RangeError');
				} else {
					payload.forEach((item) => {
						try {
							
							checkDataSchema(item, schema.items);
						} catch(error) {
							throw error;
						}
					});
				}
			}
			break;

		case 'object':
			
			if(typeof payload !== 'object') {
				throw new TypeError('TypeError');
			} else {
				
				Object.keys(payload).forEach((key) => {
					
					let prop = payload[key];
					let propsschema = schema.properties[key];

					try {
						//console.log(prop, propsschema);
						checkDataSchema(prop, propsschema);
					} catch(error) {
						throw error;
					}
				});
				
				let required = schema.required;
				
				if(
					(typeof required === 'array') &&
					(required.length > 0)
				) {
					Object.keys(required).forEach((key) => {
						if(payload[key] === undefined)
						{
							throw new SyntaxError('SyntaxError');
						}
					});
				}
			}
			break;

	}
	
	return(payload);
}

export function createInteractionRequest(source, form, schema) {
	let idata = null;

	if(typeof source === 'ReadableStream') {
		idata = new InteractionOutput(source, dataUsed, form, schema);
		return(idata);
	} else {
		let value = undefined;
		
		let schemaType = (schema.type !== undefined) && (schema.type !== null);
		let schemaInput = undefined;
		if (schema.input !== undefined && schema.input !== null){
			schemaInput = (schema.input.type !== undefined) && (schema.input.type !== null);
		}
		

		//if((schema !== undefined) && (schema.type !== undefined) && (schema.type !== null)) {
		
		var sType = null;
		let sInputs = undefined;

		if (schemaType) {
			sType = schema.type;
		} else if (schemaInput) {
			sType = schema.input.type;
			sInputs = schema.input;
		}

		
		if((schema !== undefined && (schemaType || schemaInput))) {
			//Aqui estaba schema.type
			switch(sType) {
				case 'null':
					if(source !== null) {
						throw new TypeError('TypeError');
					} else {
						value = source;
					}
					break;
					
				case 'boolean':
					if(source === false) {
						value = false;
					} else {
						value = true;
					}
					break;
					
				case 'integer':
					/*console.log({
						"source": source,
						"typeof": typeof source
					});*/
					if(
						(typeof source !== 'number') ||
						((form.minimum !== undefined) && (source < form.minimum)) ||
						((form.maximum !== undefined) && (source > form.maximum))
					) {
						throw new RangeError('RangeError');
					} else {
						value = source;
					}
					break;
				case 'number':
					
					if(
						(typeof source !== 'number') ||
						((form.minimum !== undefined) && (source < form.minimum)) ||
						((form.maximum !== undefined) && (source > form.maximum))
					) {
						throw new RangeError('RangeError');
					} else {
						value = source;
					}
					break;
					
				case 'string':
					
					if(typeof source !== 'string') {
						try {
							value = source;
						} catch(error) {
							throw new SyntaxError('SyntaxError');
						}
					} else {
						value = source;
					}
					break;
					
				case 'array':

					//if(typeof source !== 'array') { ====> Esto estaba antes y moria porque los arrays no son arrays para typeof :(
					if(!Array.isArray(source)){
						throw new TypeError('TypeError');
					} else {
						let length = source.length;
						
						if(
							((form.minItems !== undefined) && (length < form.minItems)) ||
							((form.maxItems !== undefined) && (length > form.maxItems))
						) {
							throw new RangeError('RangeError');
						} else {
							/*console.log('source', source);
							console.log('form', form);
							console.log('schema', schema);
							source.forEach((item) => {
								let itemschema = interaction.items;
								
								try {
									let item2 = createInteractionRequest(item, form, itemschema);
								} catch(error) {
									throw error;
								}
							});*/
							
							value = source;
						}
					}
					break;
					
				case 'object':
					//console.log('sourdce:',source);
					if(typeof source !== 'object') {
						throw new TypeError('TypeError');
					} else {
						
						if((typeof schema.properties !== 'object') && (typeof schema.input.properties !== 'object')) {
							throw new TypeError('TypeError');
						} else {
							Object.keys(source).forEach((key) => {
								let value = source[key];
								let propsschema = undefined;
								if(schemaType){
									propsschema = schema.properties[key];
								} else if (schemaInput) {
									propsschema = schema.input.properties[key];
								}
								try {
									value = createInteractionRequest(value, form, propsschema);
								} catch(error) {
									throw error;
								}
							});
							
							
							let sInputReq = null;
							console.log("Schema: ", schema);
							if(schema.input === undefined) {
								console.log("Schema.input is undefined");
								sInputReq = [];
							} else {
								sInputReq = schema.input.required;
							}
							if((typeof schema.required !== 'array') && (typeof sInputReq !== 'array')) {
								if(schemaType){
									schema.required.forEach((item) => {
										if(source[item] === undefined) {
											throw new SyntaxError('SyntaxError');
										}
									});
								} else if (schemaInput) {
									schema.input.required.forEach((item) => {
										if(source[item] === undefined) {
											throw new SyntaxError('SyntaxError');
										}
									});
								}
								
							}
															
							value = source;
						}
					}
					break;
					
				default:
					break;
			}
			
			idata = new InteractionOutput(value, false, form, schema);
			
			return(idata);
		} else {
		}
	}
}

export function parseInteractionResponse(response, form, schema) {
// console.log(response, form, schema)    
	// let result = new InteractionOutput(new ReadableStream(response), false, form, schema);
	let result = new InteractionOutput(response, false, form, schema);

	return(result);
}
