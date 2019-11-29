const fs = require('fs');
const path = require('path');
const { FileSystemConstants } = require('../../configs/conf');

/**
 * Adapter for file system operations.
 * Also handles the application configurations
 * 
 * @author Aswin Rajeev
 */
class FileSystemAdapter {

	/**
	 * Constructor for FileSystemAdapter
	 * 
	 * @param {*} args 
	 */
	constructor(args) {

		this.app = args.app;
		this.debugMode = args.debugMode;
		
		// define the file system locations and initializes the required properties.
		this.appDir = this.app.getPath(FileSystemConstants.APP_DIR) + path.sep + FileSystemConstants.BLOGLY_APP_DIR;
		this.confFile = this.appDir  + path.sep +  CONFIG_FILE;
		this.blogsDir = this.app.getPath(FileSystemConstants.DOCS_DIR) + path.sep + FileSystemConstants.BLOGLY_DIR;

		this.configs = null;
	}

	/**
	 * Return a configuration property.
	 * Loads the configuration is not already loaded.
	 * 
	 * @param {*} key 
	 */
	getConfigProperty(key) {

		// loads the configuration is required
		if (this.configs == null) {
			this.__loadConfigs();
		}

		return this.configs[key];
	}

	/**
	 * Sets a configuration property
	 * Writes to file if write argument is true
	 * 
	 * @param {*} key 
	 * @param {*} value 
	 * @param {*} write 
	 */
	setConfigProperty(key, value, write) {

		// loads the configuration is required
		if (this.configs == null) {
			this.__loadConfigs();
		}

		this.configs[key] = value;

		// writes the configuration if required.
		if (write) {
			this.writeToFile(this.confFile, this.configs);
		}
	} 

	/**
	 * Loads the configurations from the file.
	 * If not available, initialize the configurations.
	 */
	__loadConfigs() {
		var configs = this.readFromFile(this.confFile, null);

		if (configs == null) {
			var configs = this.__initializeConfig();
		}

		this.configs = configs;
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
			this.createDir(this.appDir)
			this.createDir(this.blogsDir);
	
			// store the conf into a config file in the user app dir
			this.writeToFile(this.confFile, JSON.stringify(conf));

			return conf;
		} catch (error) {
			console.error("Could not create the configuration file. Please check if the application has sufficient permissions to read/write in the application data directory.", error);
			throw error;
		}
	}

	/**
	 * Sets blogs directory. If it does not exists, creates it.
	 * 
	 * @param {*} dir 
	 */
	setBlogsDir(dir) {
		this.createDir(dir);
		this.blogsDir = dir;
	}

	/**
	 * Creates a directory if it doesn't exist
	 * 
	 * @param {*} dir 
	 */
	createDir(dir) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			return true;
		}

		return false;
	}

	/**
	 * Returns if the file/folder exists
	 * 
	 * @param {*} path 
	 */
	doesExist(path) {
		return fs.existsSync(path);
	}

	/**
	 * Writes data to a file
	 * 
	 * @param {*} fileName 
	 * @param {*} jsonObject 
	 */
	writeToFile(fileName, contents) {
		try {
			fs.writeFileSync(fileName, contents, "utf8");
		} catch (error) {
			console.error('Unable to write JSON', error);
			throw error;
		}
	}

	/**
	 * Reads data from a file
	 * 
	 * @param {*} fileName 
	 * @param {*} defaultValue
	 */
	readFromFile(fileName, defaultValue) {
		try {
			if (!fs.existsSync(fileName)) {
				if (defaultValue == null) {
					throw new Error("File does not exists");
				} else {
					return defaultValue;
				}
			}
			var contents = fs.readFileSync(fileName);
			return contents;
		} catch (error) {
			console.error("Could not read from file.", error);
		}
	}


}

module.exports.FileSystemAdapter = FileSystemAdapter;