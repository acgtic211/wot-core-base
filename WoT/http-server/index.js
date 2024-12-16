import { HTTPServer } from './src/HTTPServer.js';

import config from './config.js';


let httpServer = new HTTPServer(config.httpServer.hostname, config.httpServer.port, config.httpServer.pathname, config.httpServer.pathnameUI, config.httpServer.secPort);


httpServer.init();


httpServer.start();


process.on('SIGINT', (signal) => {
	httpServer.stop();

	process.exit(0);
});