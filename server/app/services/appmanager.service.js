const path = require('path');
const {
	FileSystemConstants,
	ApplicationConfigurations,
} = require('../../configs/conf');
const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { MessageManagerService } = require('./messagemanager.service');
const { BlogManagerService } = require('./blogmanager.service');
const { PostManagerService } = require('./postmanager.service');
const { ServerResponse } = require('../models/response');
const { BrowserWindow } = require('electron');
const beautify = require('js-beautify').html;
const { dialog } = require('electron');

/**
 * Manages the application operations and lifecycle.
 *
 * @author Aswin Rajeev
 */
class AppManagerService {
	/**
	 * Singleton constructor for AppManagerService
	 */
	constructor(args) {
		const defaultInstance = this.defaultInstance
			? this.defaultInstance
			: this.constructor.defaultInstance;
		if (defaultInstance) {
			if (defaultInstance.debugMode) {
				console.debug(
					'Instance already exists. Ignoring the arguments.'
				);
			}

			return defaultInstance;
		}

		this.debugMode = args.debugMode;
		this.app = args.app;
		this.menuManager = args.menuManager;
		this.blogsDir = null;
		this.blogManger = null;
		this.mainWindow = null;

		// define the file system locations and initializes the required properties.
		this.appDir =
			this.app.getPath(FileSystemConstants.APP_DIR) +
			path.sep +
			FileSystemConstants.BLOGLY_APP_DIR;
		this.configFile =
			this.appDir + path.sep + FileSystemConstants.CONFIG_FILE;
		this.blogsDir =
			this.app.getPath(FileSystemConstants.DOCS_DIR) +
			path.sep +
			FileSystemConstants.BLOGLY_DIR;

		this.configs = null;

		this.fileSystemAdapter = new FileSystemAdapter({
			debugMode: this.debugMode,
			configFile: this.configFile,
		});

		try {
			var confLastUpdated = this.fileSystemAdapter.getConfigProperty(
				'timestamp'
			);
		} catch (error) {
			console.error('Could not load the configurations.', error);
			if (this.debugMode) {
				console.debug('Attempting to initialize the configurations');
			}

			try {
				this.__initializeConfig();
			} catch (error) {
				console.error(
					'Could not initialize the configurations. Application would now abort.',
					error
				);
				//TODO: Exit the application.
			}
		}

		this.constructor.defaultInstance = this;

		/**
		 * Returns the default instance of the class
		 */
		this.constructor.getDefaultInstance = function () {
			const defaultInstance = this.constructor.defaultInstance;
			if (defaultInstance == null) {
				throw new Error('Class not initialized yet.');
			}

			return defaultInstance;
		};
	}

	/**
	 * returns the app dir for Blogly
	 */
	getAppDir() {
		return this.appDir;
	}

	/**
	 * Returns the main window
	 */
	getMainWindow() {
		return this.mainWindow;
	}

	/**
	 * Initializes the message manager service
	 * @param {*} ipcMain
	 * @param {*} mainWindow
	 */
	initializeApp(ipcMain, mainWindow) {
		this.mainWindow = mainWindow;

		// initializes the messenger service
		var messenger = new MessageManagerService({
			debugMode: this.debugMode,
			ipcMain: ipcMain,
			webContents: this.mainWindow.webContents,
		});

		this.messageManager = messenger;

		return messenger;
	}

	/**
	 * Returns the startup configurations for the main window
	 */
	getStartupConfigurations() {
		var confs = {
			width: this.fileSystemAdapter.getConfigProperty('windowWidth'),
			height: this.fileSystemAdapter.getConfigProperty('windowHeight'),
			minHeight: ApplicationConfigurations.MIN_HEIGHT,
			minWidth: ApplicationConfigurations.MIN_WIDTH,
			backgroundColor: ApplicationConfigurations.BACKGROUND_COLOR,
			show: false,
			webPreferences: {
				nodeIntegration: true,
			},
		};

		return confs;
	}

	/**
	 * Initializes the configurations
	 */
	__initializeConfig() {
		// initial window size
		var conf = {
			windowWidth: 1080,
			windowHeight: 640,
		};

		// initializes the blog directory as Blogly folder in documents.
		conf.blogsDir = this.blogsDir;
		conf.blogs = [];

		try {
			// creates the app directory and blog directory if those do not exist
			this.fileSystemAdapter.createDir(this.appDir);
			this.fileSystemAdapter.createDir(this.blogsDir);

			// store the conf into a config file in the user app dir
			this.fileSystemAdapter.writeToFile(
				this.configFile,
				JSON.stringify(conf)
			);

			return conf;
		} catch (error) {
			console.error(
				'Could not create the configuration file. Please check if the application has sufficient permissions to read/write in the application data directory.',
				error
			);
			throw error;
		}
	}

	/**
	 * Initializes the listener points for communication from the UI
	 * Also initializes the secondary service points for listening to class specific events
	 */
	initializeListeners() {
		// initializes the blog manager service
		this.blogManger = new BlogManagerService({
			debugMode: this.debugMode,
			appManager: this,
		});

		// initializes the post manager service
		this.postManager = new PostManagerService({
			debugMode: this.debugMode,
			appManager: this,
		});

		this.messageManager.respond('fetchConfs', () => {
			return this.fetchUIConfigs();
		});

		// selects a workspace directory
		this.messageManager.respond('selectDir', () => {
			return this.selectDir();
		});

		// register for UI update on event
		this.messageManager.respond('switchEditor', (data) => {
			this.messageManager.send(
				'switchEditor',
				this.switchEditor(data.content, data.editor)
			);
		});

		this.messageManager.listen('themeChanged', (args) => {
			this.setDarkThemeEnabled(args.isDarkTheme);
		});

		// this.messageManager.respond('getTheme', () => {
		// 	return this.isDarkThemeEnabled();
		// });
	}

	/**
	 * Returns the configurations for the UI
	 */
	fetchUIConfigs() {
		var response;
		this.updateStatus(true, 'Fetching configs...');

		try {
			// get workspace from the configs
			var workspace = this.fileSystemAdapter.getConfigProperty(
				'blogsDir'
			);

			var darkThemeEnabled = this.fileSystemAdapter.getConfigProperty(
				'darkThemeEnabled'
			);

			if (darkThemeEnabled == null) {
				darkThemeEnabled = true;
			}

			// use blog manager service to fetch blogs from confs
			var blogList = this.blogManger.getBlogsList();

			var result = new Object();
			result.blogs = blogList;
			result.workspace = workspace;
			result.darkThemeEnabled = darkThemeEnabled;

			response = new ServerResponse(result).ok();
			this.updateStatus(false, 'Done');
			return response;
		} catch (error) {
			console.error('Could not fetch the UI configurations.', error);
			response = new ServerResponse().failure();
			this.updateStatus(false, 'Could not fetch configs');
			return response;
		}
	}

	/**
	 * Sets/unsets the dark theme enabled
	 *
	 * @param {boolean} isDarkTheme
	 */
	setDarkThemeEnabled(isDarkTheme) {
		this.fileSystemAdapter.setConfigProperty(
			'darkThemeEnabled',
			isDarkTheme,
			true
		);
	}

	/**
	 * Transforms content as HTML editor specs to/from Quill specs
	 * @param {*} content
	 * @param {*} editor
	 */
	switchEditor(content, editor) {
		var response;
		this.updateStatus(true, 'Refreshing contents...');
		try {
			var htmlContent, fullContent;
			if (content == null || content.trim() == '') {
				htmlContent = '';
				fullContent = '';
			} else {
				if (editor == 'html') {
					fullContent = this.postManager.loadRAWImages(content);
					htmlContent = beautify(content);
				} else {
					htmlContent = this.postManager.saveAndRemoveRAWImages(
						content
					);
					htmlContent = beautify(htmlContent);
					fullContent = content;
				}
			}

			response = new ServerResponse({
				fullContent: fullContent,
				htmlContent: htmlContent,
				isHTML: editor == 'html',
			}).ok();
			this.updateStatus(false, 'Done');
		} catch (error) {
			response = new ServerResponse().failure();
			this.updateStatus(false, 'Could not refresh contents');
		}

		return response;
	}

	/**
	 * Updates the blog to the publish/draft/import menus
	 *
	 * @param {*} menuManager
	 */
	updateBlogsMenus() {
		// clear the blogs menus
		this.menuManager.clearBlogs();

		// updates all blogs to the blogs menu.
		var blogs = this.blogManger.getBlogsList();
		blogs.forEach((blogObj) => {
			this.menuManager.addBlog(blogObj);
		});
		// reconstructs the menu.
		try {
			this.menuManager.renderMenu();
		} catch (error) {
			//ignore
		}
	}

	/**
	 * Creates a modal window and returns it
	 * @param {*} args
	 */
	createModalWindow(args) {
		var height = args.height ? args.height : 500;
		var width = args.width ? args.width : 400;
		var title = args.title ? args.title : 'Blogly';

		var window = new BrowserWindow({
			height: height,
			resizable: false,
			width: width,
			title: title,
			modal: true,
			parent: this.mainWindow,
			fullscreenable: false,
			show: false,
		});

		return window;
	}

	/**
	 * Opens a select directory dialog and returns the selected dir path.
	 * Restarts the aplplication if selected.
	 */
	selectDir() {
		var response;
		var path = dialog.showOpenDialog(this.mainWindow, {
			properties: ['openDirectory'],
		});

		dialog.showMessageBox(
			this.mainWindow,
			{
				type: 'info',
				buttons: ['Confirm', 'Cancel'],
				message:
					'Changing workspace will require a restart. Are sure to continue?',
				title: 'Confirm Configuration',
			},
			(result) => {
				if (result == 0) {
					try {
						this.fileSystemAdapter.saveConfigForLater(
							'blogsDir',
							path[0]
						);
					} catch (error) {
						console.error(
							'Unable to save the workspace path.',
							error
						);
					}

					this.app.relaunch();
					this.app.exit(0);

					response = new ServerResponse({
						path: path,
					}).ok();
					return response;
				} else {
					this.updateStatus(false, 'Discarded config');
					return new ServerResponse().failure();
				}
			}
		);
	}

	/**
	 * Updates a status message to the UI
	 * @param {*} loading
	 * @param {*} message
	 */
	updateStatus(loading, message) {
		this.messageManager.send('statusUpdate', {
			loading: loading,
			message: message,
		});
	}
}

module.exports.AppManagerService = AppManagerService;
