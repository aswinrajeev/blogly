const fs = require('fs');
const path = require('path');

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

		const defaultInstance = this.defaultInstance;
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

		/**
		 * Returns the default instance of the class
		 */
		this.constructor.getDefaultInstance = function() {
			const defaultInstance = this.defaultInstance;
			if (defaultInstance == null) {
				throw new Error('Class not initialized yet.');
			}

			return defaultInstance;
		}

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
			this.writeToFile(this.configFile,  JSON.stringify(this.configs));
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
	 * Generates out of a name, a unique filename for a directory and returns it
	 * @param {*} fileName 
	 * @param {*} extn
	 * @param {*} dir
	 */
	generateFileName(name, extn, dir) {
		var fileName = name.split(' ').join('_');
		var index = 1;

		fileName = fileName.length > 8 ? fileName.substring(0, 15) : fileName;
		var newFileName = fileName;

		// continue incrementing the number till no files with the same name found
		while (this.doesExist(dir + path.sep + newFileName + extn)) {
			newFileName = fileName + ++index;
		}

		return newFileName + extn;
	}

	/**
	 * Returns if the file/folder exists
	 * 
	 * @param {*} path 
	 */
	doesExist(path) {
		try {
			return fs.existsSync(path);
		} catch (error) {
			console.error('Could not check if file/folder exists.', error);
			throw error;
		}
	}

	getFilesInDir(dirPath) {
		try {
			var fileList = fs.readdirSync(dirPath);
			return fileList;
		} catch (error) {
			console.error('Could not fetch the files in the directory.', error);
			throw error;
		}
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
			var contents = fs.readFileSync(fileName, "utf8");
			return contents;
		} catch (error) {
			console.error("Could not read from file.", error);
			throw error;
		}
	}

	/**
	 * Deletes a file
	 * 
	 * @param {*} fileName 
	 */
	deleteFile(fileName) {
		try {
			fs.unlinkSync(fileName);
		} catch (error) {
			console.error('Could not delete file.', error);
			throw error;
		}

	}
}

module.exports.FileSystemAdapter = FileSystemAdapter;