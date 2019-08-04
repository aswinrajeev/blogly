const { app, BrowserWindow } =  require('electron');
const { ipcMain, WebContents } = require('electron');
const { MessagingService } = require('./app/messaging_service');
const { BlogService } = require('./app/blog_service');
const { testBlogUrl } = require('./localconfigs/tests'); //temporary test configs
const { FileSystemService } = require('./app/files_service');


class MainWindow {

	constructor() {
		this.mainWindow = null;
		this.fservice = null;
		app.on('ready', this.initializeApp);
	}

	initializeApp() {

		// get all cofigurations loaded
		try {

			// initialize the file system service
			this.fservice = new FileSystemService(app);
			this.fservice.initalize();
	
			// initialize a new window
			this.mainWindow = new BrowserWindow({ 
				width: this.fservice.getProperty('width'), 
				height: this.fservice.getProperty('height'), 
				minHeight: 618,
				minWidth: 1080,
				show: false,
				backgroundColor: 'rgb(55, 55, 55)'
			});
	
			// load the compiled index.html file
			this.mainWindow.loadFile('./out/client/blogly/index.html');
	
			// initialize the messaging service
			this.messenger = new MessagingService(ipcMain, this.mainWindow.webContents);
	
			// register events for blogging services
			this.blogservice = new BlogService(this.messenger, testBlogUrl);
			this.blogservice.initialize();

			this.fservice.setMessenger(this.messenger);

			// display the window once ready
			this.mainWindow.once('ready-to-show', () => {
				this.mainWindow.show();
			});

		} catch (error) {
			console.error(error);
		}

	}
	
}

new MainWindow();