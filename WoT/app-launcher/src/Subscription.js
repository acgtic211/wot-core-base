export class Subscription {
	constructor(type, name, interaction, form, id, securityManager, protocolManager) {
		this._type = undefined;
		this._name = undefined;
		this._interaction = undefined;
		this._form = undefined;
		
		this.id = undefined;
		this.securityManager = undefined;
		this.protocolManager = undefined;

		this.active = undefined;
		
		this._type = type;
		this._name = name;
		this._interaction = interaction;
		this._form = form;

		this.id = id;
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
	}
	
	stop(options) {
		return new Promise((resolve, reject) => {
			if(this.securityManager.validateContext() === false) {
				reject(new SecurityError('SecurityError'));
			} else {
				let unsubscribeForm = undefined;
				
				if(
					(options !== undefined) &&
					(options.formIndex !== undefined)
				){
					unsubscribeForm = this._interaction.forms[options.formIndex];

				} else {
					unsubscribeForm = findAMatchingUnsubscribeForm(this._type, this._interaction, this._form);
				}
				
				if(unsubscribeForm === undefined) {
					reject(new SyntaxError('SyntaxError'));
				} else {
					if(this._type === 'property') {
						this.protocolManager.consumeService(this.id, this._name, 'unobserveproperty', unsubscribeForm, undefined, options, undefined, undefined, undefined)
						.then(() => resolve())
						.catch((error) => reject(error));
					} else {
						if(type === 'event') {
							this.protocolManager.consumeService(this.id, this._name, 'unsubscribeevent', unsubscribeForm, undefined, options, undefined, undefined, undefined)
							.then(() => resolve())
							.catch((error) => reject(error));
						} else {
							this.active = false;

							resolve();
						}
					}
				}
			}
		});
	}
}

function findAMatchingUnsubscribeForm(type, interaction, form) {
	let results = [];
	
	interaction.forms.forEach((form2) => {
		form2._matchLevel = 0;

		
		
		let found1 = false;
		let found2 = false;

		switch(typeof form2.op) {
			case 'string':
				if(form2.op === 'unobserveproperty') {
					found1 = true;
				}
				break;
				
			case 'object':
				let index = form2.op.indexOf('unobserveproperty');
				
				if(index > -1) {
					found1 = true;
				}
				break;
		}

		switch(typeof form2.op) {
			case 'string':
				if(form2.op === 'unsubscribeevent') {
					found2 = true;
				}
				break;
				
			case 'object':
				let index = form2.op.indexOf('unsubscribeevent');
				
				if(index > -1) {
					found2 = true;
				}
				break;
		}
		
		
		if(
			(
				(found1 === true) && 
				(type === 'property')
			) ||
			(
				(found2 === true) && 
				(type === 'event')
			)
		) {
			form2._matchLevel = 1;
			
			results.push(form2);
			
			if(form.href === form2.href) {
				form2._matchLevel += 1;
			}
			
			if(
				(form.contentType === form2.contentType) &&
				(form2._matchLevel > 2)
			) {
				form2._matchLevel += 1;
			}
		}
	});
	
	if(results.length === 0) {
		return null;
	} else {
		return results.reduce((form1, form2) => form1._matchLevel > form2._matchLevel ? form1 : form2);
	}
}
