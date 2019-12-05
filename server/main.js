const { app, Menu, BrowserWindow } =  require('electron');
const { ipcMain, WebContents } = require('electron');
const { AppManagerService } = require('./app/services/appmanager.service');
const { MenuHandler } = require('./app/menu_handler');
const { systemPreferences } = require('electron');

/**
 * @author Aswin Rajeev
 * @copyright Aswin (c) 2018 - 2019
 * 
 * The main handler for the blogly application. Root point of entry to the application.
 */
class MainWindow {

	constructor() {
		this.mainWindow = null;
		this.messageService = null;
		this.menuHandler
		this.appManager


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
			systemPreferences.subscribeNotification(
				'AppleInterfaceThemeChangedNotification',
				function theThemeHasChanged () {
					console.log('The theme has been changed to ' + systemPreferences.isDarkMode() ? 'dark' : 'light');
				}
			)

		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Initializes all the application services
	 */
	initializeAppServices() {

		// initializes menu handler
		this.menuHandler = new MenuHandler(Menu, app);

		// initialize app manager service
		this.appManager = new AppManagerService({
			app: app,
			debugMode: true
		});
	}

	/**
	 * Creates the main window and displays it
	 */
	createMainWindow() {
		// sets the application menu
		Menu.setApplicationMenu(this.menuHandler.getMenu());
		
		// initialize a new window
		var windowConfigs = this.appManager.getStartupConfigurations();
		this.mainWindow = new BrowserWindow(windowConfigs);
		
		// initializes the message manager service
		this.messageService = this.appManager.initializeApp(ipcMain, this.mainWindow);
		this.menuHandler.setMessenger(this.messageService);
		
		// initializes the listeners for UI events
		this.appManager.initializeListeners();

		// load the compiled index.html file
		this.mainWindow.loadFile('./out/client/blogly/index.html');

		// display the window once ready
		this.mainWindow.once('ready-to-show', () => {
			this.mainWindow.show();
		});
	}
	
}

new MainWindow();