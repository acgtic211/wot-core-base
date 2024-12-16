import cors from 'cors';
import express from 'express';


export class Repository {
	constructor(hostname, port, wcPathname, wotPathname, wcFolder, wotFolder, wotnectivity, wotnectivityPath) {
		this.hostname = hostname;
		this.port = port;
		this.wcPathname = wcPathname;
		this.wotPathname = wotPathname;
		this.wcFolder = wcFolder;
		this.wotFolder = wotFolder;

		this.wotnectivity = wotnectivity;
		this.wotnectivityPath = wotnectivityPath;
		
		this.app = null;
	}
	
	
	init() {
		this.app = express();

		
		this.app.use(cors());
		this.app.use(this.wcPathname, express.static(this.wcFolder));
		this.app.use(this.wotPathname, express.static(this.wotFolder));
		this.app.use(this.wotnectivityPath, express.static(this.wotnectivity));

		this.app.get('/favicon.ico', ((request, response) => {
			response.status(204);
			response.end();
		}));
	}

	
	start() {
		// this.app.listen(this.port, this.hostname);
		this.app.listen(this.port);
		
		console.log('Repository started...');
	}
	
	
	stop() {
		console.log('Repository stopped...');
	}
}