const { app, BrowserWindow } =  require('electron');
const { ipcMain, WebContents } = require('electron');
const { MessagingService } = require('./app/messaging_service');
const { BlogService } = require('./app/blog_service');
const { testBlogUrl } = require('./localconfigs/tests'); //temporary test configs


class MainWindow {

	constructor() {
		this.mainWindow = {};
		app.on('ready', this.initializeApp);
	}

	initializeApp() {

		//Initialize a new window
		this.mainWindow = new BrowserWindow({ 
			width: 1080, 
			height: 640, 
			minHeight: 618,
			minWidth: 1080,
			show: false,
			backgroundColor: 'rgb(55, 55, 55)'
		});

		//Load the compiled index.html file
		this.mainWindow.loadFile('./out/client/blogly/index.html');

		//Display the window once ready
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show();
		});

		// Initialize the messaging service
		this.messenger = new MessagingService(ipcMain, this.mainWindow.webContents);

		// Register events for blogging services
		this.blogservice = new BlogService(this.messenger, testBlogUrl);
		this.blogservice.initialize();

	}
	
}

new MainWindow();