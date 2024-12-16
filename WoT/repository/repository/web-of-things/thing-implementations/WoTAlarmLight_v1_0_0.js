import schedule from 'node-schedule';

export class WoTAlarmLight_v1_0_0 {
	constructor(config, securityManager, protocolManager, emitPropertyChange, emitEvent) {
	    this.datastore = {
    		status: config.status,
			alarm: config.alarm,
			sunsetDuration: config.sunsetDuration, // 30 // 2
			sunsetOff: config.sunsetOff, // 10 // 1
			intervalOff: config.intervalOff,
			steps: config.steps,
			daytime: false,
			wakeuptime: false
	    };
	    
		this.securityManager = securityManager;
		this.protocolManager = protocolManager;
		
		this.emitPropertyChange = emitPropertyChange;
		this.emitEvent = emitEvent;
		
		this.handlers = {
			'status': {
				'readHandler': (options) => this.readStatus(options), 
				'writeHandler': (name, value, options) => this.writeStatus(name, value, options)
			},
			'alarm': {
				'readHandler': (options) => this.readAlarm(options), 
				'writeHandler': (name, value, options) => this.writeAlarm(name, value, options)
			},
			'toggle': {
				'actionHandler': (name, inputs, options) => this.toggle(name, inputs, options)
			},
			'isItDaytime': {
				'actionHandler': (name, inputs, options) => this.isItDaytime(name, inputs, options)
			},
			'isItWakeUpTime': {
				'actionHandler': (name, inputs, options) => this.isItWakeUpTime(name, inputs, options)
			}
		};

		
        this.interval1 = null;
        this.interval2 = null;
        this.interval3 = null;
	}

	
	readStatus(options) {
		return new Promise((resolve, reject) => resolve({ status: this.datastore.status }));
	}

	
	writeStatus(name, value, options) {
		return new Promise((resolve, reject) => {
			this.datastore.status = value;

			if(
				(options !== undefined) &&
				(options.data !== undefined) &&
				(options.data.init !== undefined) &&
				(options.data.init === true)
			) {
				resolve();
			} else {
				this.emitPropertyChange('status')
				.then(() => {
					this.emitEvent('onChangeStatus', { status: this.datastore.status })
					.then(() => resolve())
					.catch((error) => reject(error));
				})
				.catch((error) => reject(error));
			}	
		});
	}

	
	readAlarm(options) {
		return new Promise((resolve, reject) => resolve({ alarm: this.datastore.alarm }));
	}

	
	writeAlarm(name, value, options) {
		return new Promise((resolve, reject) => {
			this.datastore.alarm = value;

			let alarmSpec = this.getAlarmSpec();
// console.log('alarmSpec', alarmSpec)

			let sunsetOnSpec = this.getSunsetOnSpec();
// console.log('sunsetOnSpec', sunsetOnSpec)

			let sunsetOffSpec = this.getSunsetOffSpec();
// console.log('sunsetOffSpec', sunsetOffSpec)


			schedule.rescheduleJob('job1', sunsetOnSpec);
			schedule.rescheduleJob('job2', sunsetOffSpec);
				
				
			if(
				(options !== undefined) &&
				(options.data !== undefined) &&
				(options.data.init !== undefined) &&
				(options.data.init === true)
			) {
				resolve();
			} else {
				this.emitPropertyChange('alarm')
				.then(() => {
					this.emitEvent('onChangeAlarm', { alarm: this.datastore.alarm })
					.then(() => resolve())
					.catch((error) => {
// console.log('writeAlarm', error)			    
					    reject(error)
				    });
				})
				.catch((error) => {
// console.log('writeAlarm 2', error)			    
				    reject(error)
			    });
			}	
		});
	}
	
	
	toggle(name, inputs, options) {
		return new Promise((resolve, reject) => {
			this.writeStatus('status', !this.datastore.status, options)
			.then(() => {
				if(this.datastore.status === true) {
					console.log("STARTING ALARM JOBS");
					this.startJobs();
				} else {
					this.stopJobs();
				}
				
				resolve();
			})
			.catch((error) => {
			    reject(error)
		    });
		});
	}

	isItDaytime(name, inputs, options) {
		return new Promise((resolve, reject) => {
			let currentHour = (new Date()).getHours();
			let currentMin = (new Date()).getMinutes();
			console.log("IS IT DAYTIME INPUTS: ", inputs);
			//Daytime Google dice que es a las 8 more or less
			if(currentHour > 8 && currentHour < 20 && parseFloat(inputs.brightness) > 10000.0) {
				this.datastore.daytime = true;
				resolve();
			} else {
				this.datastore.daytime = false;
				resolve();
			}
		})
	}

	isItWakeUpTime(name, inputs, options) {
		return new Promise((resolve, reject) => {
			console.log("Inputs wakeup time: ", inputs);
			let currentHour = (new Date()).getHours();
			let currentMin = (new Date()).getMinutes();
			//WakeUp time es el de la alarma more or less
			if(inputs.state === 'on') {
				if(parseInt(this.datastore.alarm.minute) >= 55) {
					if((currentHour === parseInt(this.datastore.alarm.hour) && currentMin >= 50) || (currentHour === (parseInt(this.datastore.alarm.hour) + 1)) && currentMin <= 5){
						this.datastore.wakeuptime = true;
						resolve();
					} else {
						this.datastore.wakeuptime = false;
						resolve();
					}
				} else if(parseInt(this.datastore.alarm.minute) <= 5) {
					if((currentHour === (parseInt(this.datastore.alarm.hour) - 1) && currentMin >= 55) || (currentHour === parseInt(this.datastore.alarm.hour)) && currentMin <= 10){
						this.datastore.wakeuptime = true;
						resolve();
					} else {
						this.datastore.wakeuptime = false;
						resolve();
					}
				} else if((currentHour === (parseInt(this.datastore.alarm.hour)) && ((currentMin) === (parseInt(this.datastore.alarm.minute)) || (currentMin) <= (parseInt(this.datastore.alarm.minute) + 5) || (currentMin) <= (parseInt(this.datastore.alarm.minute) + 5)))) {
					this.datastore.wakeuptime = true;
					resolve();
				} else {
					this.datastore.wakeuptime = false;
					resolve();
				}
			} else {
				resolve();
			}
			
		})
	}
	
	startJobs() {

		let alarmSpec = this.getAlarmSpec();
// console.log('alarmSpec', alarmSpec)

		let sunsetOnSpec = this.getSunsetOnSpec();
		console.log('sunsetOnSpec', sunsetOnSpec)

		let sunsetOffSpec = this.getSunsetOffSpec();
// console.log('sunsetOffSpec', sunsetOffSpec)
		let timestamp = (new Date()).getTime();
		console.log("TIME NOW: ", new Date(timestamp).toLocaleTimeString('es-ES'));

		schedule.scheduleJob('job1', sunsetOnSpec, () => {
			
			//console.log('>>> WoTAlarmLight_v1_0_0 <<<', (new Date()).toString())
			
			let step = 0;

			this.emitEvent('onStart', {})
			.then(() => {console.log("Event onStart emitted");})
			.catch((error) => console.log(error));

			let eventAlarm = null;

			console.log("DAYTIME: ", this.datastore.daytime);
			console.log("WAKUPTIME: ", this.datastore.wakeuptime);			
			
			this.interval1 = setInterval(() => {
				if(step === this.datastore.steps.length-1) {
					clearInterval(this.interval1);
				} else {

					step += 1;
					

					if(this.datastore.daytime){
						this.emitEvent('onScheduled1-2', { position: 75 })
						.then(() => { console.log("Event onScheduled1-2 emitted")})
						.catch((error) => console.log(error));
					} else {
						this.emitEvent('onScheduled1', { status: this.datastore.steps[step].status })
						.then(() => { console.log("Event onScheduled1 emitted")})
						.catch((error) => console.log(error));
					}
		
					if(this.datastore.daytime){
						this.emitEvent('onScheduled1-2', { position: 50 })
						.then(() => { console.log("Event onScheduled1-2 emitted")})
						.catch((error) => console.log(error));
					} else {
						this.emitEvent('onScheduled2', { bri: this.datastore.steps[step].brightness })
						.then(() => {})
						.catch((error) => console.log(error));
					}
		
					if(this.datastore.daytime){
						this.emitEvent('onScheduled1-2', { position: 25 })
						.then(() => { console.log("Event onScheduled1-2 emitted")})
						.catch((error) => console.log(error));
					} else {
						this.emitEvent('onScheduled3', { ct: this.datastore.steps[step].colorTemperature })
						.then(() => {})
						.catch((error) => console.log(error));
					}
		
					if(this.datastore.wakeuptime){
						console.log("IM GOING TO EMIT ON SCHEDULE 4");
						this.emitEvent('onScheduled4', { status: this.datastore.steps[step].status})
						.then(()=> { console.log("Event onSchedule 4 emitted");})
						.catch((error) => console.log(error));
					}
		
					if(!this.datastore.daytime) {
						this.emitEvent('onScheduled1-2', { position: 25 })
						.then(() => { console.log("Event onScheduled1-2 emitted")})
						.catch((error) => console.log(error));
					}

// console.log('>>> 1', new Date().toString())
					/*
					this.emitEvent('onScheduled1', { status: this.datastore.steps[step].status })
					.then(() => {})
					.catch((error) => console.log(error));
// console.log('onScheduled1');				

					this.emitEvent('onScheduled2', { bri: this.datastore.steps[step].brightness })
					.then(() => {})
					.catch((error) => console.log(error));
// console.log('onScheduled2');				

					this.emitEvent('onScheduled3', { ct: this.datastore.steps[step].colorTemperature })
					.then(() => {})
					.catch((error) => console.log(error));*/
// console.log('onScheduled3');				
				}
			}, ( parseInt((this.datastore.sunsetDuration * 60 * 1000) / (this.datastore.steps.length-1)) ));
			
			
			
			this.interval2 = setTimeout(() => {
// console.log('>>> 1.5', new Date().toString())
				this.emitEvent('onMiddle', {})
				.then(() => {})
				.catch((error) => console.log(error));
// console.log('onMiddle')			
			}, ( parseInt((this.datastore.sunsetDuration * 60 * 1000) / 2) ));
		});

		
		schedule.scheduleJob('job2', sunsetOffSpec, () => {
// console.log('>>> 2', new Date().toString())
			this.emitEvent('onScheduled2', { bri: this.datastore.steps[0].brightness })
			.then(() => {})
			.catch((error) => console.log(error));

			this.emitEvent('onScheduled3', { ct: this.datastore.steps[0].colorTemperature })
			.then(() => {})
			.catch((error) => console.log(error));

			this.interval3 = setTimeout(() => {
// console.log('>>> 3', new Date().toString())

				this.emitEvent('onScheduled1', { status: false })
				.then(() => {})
				.catch((error) => console.log(error));

				this.emitEvent('onEnd', {})
				.then(() => {})
				.catch((error) => console.log(error));
// console.log('onEnd')			
			}, this.datastore.intervalOff);
		});
	}
	
	
	stopJobs() {
        clearInterval(this.interval1);
        clearInterval(this.interval2);
        clearInterval(this.interval3);
        
	    schedule.cancelJob('job1');
	    schedule.cancelJob('job2');


		this.emitEvent('onScheduled2', { bri: this.datastore.steps[0].brightness })
		.then(() => {})
		.catch((error) => console.log(error));

		
		// this.emitEvent('onScheduled3', { colorTemperature: this.datastore.steps[0].colorTemperature })
		// .then(() => {})
		// .catch((error) => console.log(error));

		
		this.interval3 = setTimeout(() => {
			this.emitEvent('onScheduled1', { status: false })
			.then(() => {})
			.catch((error) => console.log(error));

			this.emitEvent('onEnd', { timeout: null })
			.then(() => {})
			.catch((error) => console.log(error));
		}, this.datastore.intervalOff);
	}
	
	
	getAlarmSpec() {
	    let date = '';
        date += this.datastore.alarm.second + ' ';
        date += this.datastore.alarm.minute + ' ';
        date += this.datastore.alarm.hour + ' ';
        date += this.datastore.alarm.dayOfMonth + ' ';
        date += this.datastore.alarm.month + ' ';
        date += this.datastore.alarm.dayOfWeek;
        
        return(date);
    }
	
	
	getSunsetOnSpec() {
/*		
		let sunsetDuration = this.datastore.sunsetDuration * 60 * 1000;

		let d = new Date();
		d.setHours(this.datastore.alarm.hour);
		d.setMinutes(this.datastore.alarm.minute);
		d.setSeconds(0);
		d.setMilliseconds(0);

		let now = new Date();

		if (d - now < sunsetDuration) {
			d.setDate(d.getDate() + 1);
		}
		
		let sunset = new Date(d.getTime() - sunsetDuration);
		let sunsetH = sunset.getHours();
		let sunsetM = sunset.getMinutes();

		let date = '';
		date += this.datastore.alarm.second + ' ';
		date += sunsetM + ' ';
		date += sunsetH + ' ';
		date += this.datastore.alarm.dayOfMonth + ' ';
		date += this.datastore.alarm.month + ' ';
		date += this.datastore.alarm.dayOfWeek;

        return(date);
*/

	    let date = '';
        date += this.datastore.alarm.second + ' ';
        date += this.datastore.alarm.minute + ' ';
        date += this.datastore.alarm.hour + ' ';
        date += this.datastore.alarm.dayOfMonth + ' ';
        date += this.datastore.alarm.month + ' ';
        date += this.datastore.alarm.dayOfWeek;
        
        return(date);
	}
	
	
	getSunsetOffSpec() {
		let sunsetDuration = this.datastore.sunsetDuration * 60 * 1000;
		let sunsetOff = this.datastore.sunsetOff * 60 * 1000;

		let d = new Date();
		d.setHours(this.datastore.alarm.hour);
		d.setMinutes(this.datastore.alarm.minute);
		d.setSeconds(0);
		d.setMilliseconds(0);

		let now = new Date();

		if (d - now < sunsetDuration + sunsetOff) {
			d.setDate(d.getDate() + 1);
		}
		
		let sunset = new Date(d.getTime() + sunsetDuration + sunsetOff);
		let sunsetH = sunset.getHours();
		let sunsetM = sunset.getMinutes();

		let date = '';
		date += this.datastore.alarm.second + ' ';
		date += sunsetM + ' ';
		date += sunsetH + ' ';
		date += this.datastore.alarm.dayOfMonth + ' ';
		date += this.datastore.alarm.month + ' ';
		date += this.datastore.alarm.dayOfWeek;

        return(date);
	}
	
	
}