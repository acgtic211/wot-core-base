import { Repository } from './src/Repository.js';

import config from './config.js';


let repository = new Repository(config.repository.hostname, config.repository.port, config.repository.wcPathname, config.repository.wotPathname, config.repository.wcFolder, config.repository.wotFolder, config.repository.nodeModules, config.repository.nodeModulesPath);


repository.init();


repository.start();


process.on('SIGINT', (signal) => {
	repository.stop();
	
	process.exit(0);
});