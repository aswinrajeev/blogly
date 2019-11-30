const fs = require('fs');

/**
 * Adapter for file system operations.
 * Also handles the application configurations.
 * 
 * @author Aswin Rajeev
 */
class FileSystemAdapter {

	/**
	 * Singleton constructor for FileSystemAdapter
	 * 
	 * @param {*} args 
	 */
	constructor(args) {

		const defaultInstance = this.constructor.defaultInstance;
		if (defaultInstance) {

			if (defaultInstance.debugMode) {
				console.debug("Instance already exists. Ignoring the arguments.");
			}

			return defaultInstance;
		} 
			
		this.configs = null;
		this.debugMode = args.debugMode;
		this.configFile = args.configFile;

		this.constructor.defaultInstance = this;

	}

	/**
	 * Returns the default instance of the class
	 */
	getDefaultInstance() {
		const defaultInstance = this.constructor.defaultInstance;
		if (defaultInstance == null) {
			throw new Error('Class not initialized yet.');
		}

		return defaultInstance;
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

		// sets the property value
		this.configs[key] = value;
		
		// writes the configuration if required.
		if (write) {
			
			// sets the updated timestamp
			this.configs['timestamp'] = Math.floor(Date.now());

			//writes into the config file
			this.writeToFile(this.configFile, this.configs);
		}
	}

	/**
	 * Loads the configurations from the file.
	 * If not available, initialize the configurations.
	 */
	__loadConfigs() {
		var configs = this.readFromFile(this.configFile, null);

		if (configs == null) {
			throw new Error("Error in loading configuratons.");
		}

		this.configs = JSON.parse(configs);
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