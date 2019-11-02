const { app, BrowserWindow } =  require('electron');
const { ipcMain, WebContents } = require('electron');
const { MessagingService } = require('./app/messaging_service');
const { BlogService } = require('./app/blog_service');
const { testBlogUrl } = require('./localconfigs/tests'); //temporary test configs
const { FileSystemService } = require('./app/files_service');

/**
 * @author Aswin Rajeev
 * @copyright Aswin (c) 2018 - 2019
 * 
 * The main handler for the blogly application. Root point of entry to the application.
 */
class MainWindow {

	constructor() {
		this.mainWindow = null;
		this.fsService = null;

		//register async initialization of the application window.
		app.on('ready', this.initializeApp);
	}

	/**
	 * Initializes the application. This initializes the following:
	 * - blogly file system service 
	 * - main application window
	 */
	initializeApp() {

		// get all cofigurations loaded
		try {

			// initialize the file system service
			this.fsService = new FileSystemService(app);
			this.fsService.initalize();
	
			// initialize a new window
			this.mainWindow = new BrowserWindow({ 
				width: this.fsService.getConfigProperty('width'), 
				height: this.fsService.getConfigProperty('height'), 
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
			this.blogservice = new BlogService(this.messenger, testBlogUrl, this.fsService);
			this.blogservice.initialize();

			this.fsService.setMessenger(this.messenger);

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