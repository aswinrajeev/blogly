import { app, BrowserWindow } from 'electron';
import { ipcMain, WebContents } from 'electron';

// const MessagingService = require('./messaging.js');

class MainWindow {

	mainWindow;
	messenger;

	constructor() {
		app.on('ready', this.initializeApp);
	}

	initializeApp() {

		//Initialize a new window
		this.mainWindow = new BrowserWindow({ 
			width: 1080, 
			height: 640, 
			show: false,
			backgroundColor: 'rgb(55, 55, 55)'
		});

		//Load the compiled index.html file
		this.mainWindow.loadFile('./out/client/blogly/index.html');

		//Display the window once ready
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show();
		});

		// //Initialize messaging service
		// this.messenger = new MessagingService(ipcMain, this.mainWindow.webContents);

		// //Register a debug log listener
		// this.messenger.listen('debug', function(payload) {
		// 	console.log(payload.msg);
		// });

		// //Respond in the event of a request test
		// this.messenger.respond('reqtest', function(payload, event) {
		// 	console.log(payload.msg);
		// 	return payload.msg + ' acknowledged';
		// });

	}
	
}

new MainWindow();