import { LocalAppLauncher } from './src/LocalAppLauncher.js';

import config from './config.js';

let appLauncher = new LocalAppLauncher(config);


appLauncher.initialize()
.then(() => {
    appLauncher.start()
    .then(() => {
        if(config.autoLoadApp === true) {
        	appLauncher.loadAppDescription(config.appDescriptionHref)
        	.then(() => {
                if(config.autoStartApp === true) {
					
        			appLauncher.startAllServients()
        			.then(() => {})
        			.catch((errors) => {
                        errors.forEach((error) => {
                            console.log('')
                            console.log(error.stack)
                        });
        			});
                }
        	})
        	.catch((error) => {
                console.log('')
                console.log(error)
        	});
        }
    })
    .catch((error) => {})
})
.catch((error) => {})


process.on('SIGINT', (signal) => {
	appLauncher.stop()
	.then(() => {})
	.catch((error) => {})
	.finally(() => {
		appLauncher.terminate()
		.then(() => {})
		.catch((error) => {})
		.finally(() => {
			process.exit(0);
		})
	})
});