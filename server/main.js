const { app, Menu, BrowserWindow } =  require('electron');
const { ipcMain, WebContents } = require('electron');
const { AppManagerService } = require('./app/services/appmanager.service');
const { MenuManagerService } = require('./app/services/menumanager.service');
const { systemPreferences } = require('electron');

/**
 * @author Aswin Rajeev
 * @copyright Aswin (c) 2018 - 2019
 * 
 * The main handler for the blogly application. Root point of entry to the application.
 */
class MainWindow {

	/**
	 * Constructor for the main window
	 */
	constructor() {
		this.mainWindow = null;
		this.messageService = null;
		this.menuHandler;
		this.appManager;

		this.isMac = (process.platform === 'darwin');

		//register async initialization of the application window.
		app.on('ready', () => {
			this.initializeApp()
		});
	}

	/**
	 * Initializes the application. This initializes the following:
	 * - blogly file system service 
	 * - main application window
	 */
	initializeApp() {

		// get all cofigurations loaded
		try {

			// initialize app services
			this.initializeAppServices();

			// creates the main window
			this.createMainWindow();

			// subscribe to the system preferences
			if (this.isMac) {
				systemPreferences.subscribeNotification(
					'AppleInterfaceThemeChangedNotification',
					function theThemeHasChanged () {
						console.log('The theme has been changed to ' + systemPreferences.isDarkMode() ? 'dark' : 'light');
					}
				)
			}

		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Initializes all the application services
	 */
	initializeAppServices() {

		// initializes menu handler
		this.menuHandler = new MenuManagerService(Menu, app);

		// initialize app manager service
		this.appManager = new AppManagerService({
			app: app,
			debugMode: true,
			menuManager: this.menuHandler
		});
	}

	/**
	 * Creates the main window and displays it
	 */
	createMainWindow() {
		// initialize a new window
		var windowConfigs = this.appManager.getStartupConfigurations();
		this.mainWindow = new BrowserWindow(windowConfigs);
		
		// initializes the message manager service
		this.messageService = this.appManager.initializeApp(ipcMain, this.mainWindow);
		this.menuHandler.setMessenger(this.messageService);
		
		// initializes the listeners for UI events
		this.appManager.initializeListeners();
		
		// sets the application menu
		this.appManager.updateBlogsMenus(this.menuHandler);
		this.menuHandler.setMenu(Menu);
		
		// load the compiled index.html file
		this.mainWindow.loadFile('./out/client/blogly/index.html');

		// display the window once ready
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show();
		});
	}
	
}

// initializes the main window and starts the process.
new MainWindow();