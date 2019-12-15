const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { DriveAPIAdapter } = require('../adapters/driveapi.adapter');
const { GoogleAPIAdapter } = require('../adapters/googleapi.adapter');
const { FileSystemConstants, Permissions } = require('../../configs/conf');
const { MessageManagerService } = require('./messagemanager.service');
const path = require('path');

/**
 * Manages the media related functionalities
 * @author Aswin Rajeev
 */
class MediaManagerService {
	/**
	 * Singleton constructor for media manager service
	 * @param {*} args 
	 */
	constructor(args) {
		const defaultInstance = this.defaultInstance ? this.defaultInstance : this.constructor.defaultInstance;
		if (defaultInstance) {
			if (defaultInstance.debugMode) {
				console.debug('Instance already exists. Ignoring the arguments.');
			}
			return defaultInstance;
		}

		this.debugMode = args.debugMode;
		this.appManager = args.appManager;

		// get instances for file system adapter and message manager, as those would be already initialized
		this.fileSystemAdapter = FileSystemAdapter.getDefaultInstance();
		this.messageManager = MessageManagerService.getDefaultInstance();
		this.driveAPI = new DriveAPIAdapter({
			debugMode: this.debugMode
		});

		this.constructor.defaultInstance = this;

		/**
		 * Returns the default instance of the class
		 */
		this.constructor.getDefaultInstance = function() {
			const defaultInstance = this.constructor.defaultInstance;
			if (defaultInstance == null) {
				throw new Error('Class not initialized yet.');
			}

			return defaultInstance;
		}
	}

	__getTempDir() {
		try {
			var temp =  this.appManager.getAppDir() + path.sep + "_temp";
			
			// creates the temp dir if it does not exist
			this.fileSystemAdapter.createDir(temp);
			return temp;
		} catch (error) {
			console.error("Error creating temp directory.", error);
			throw error;
		}
	}

	/**
	 * Returns the Blogly Google Drive media directory id from the configurations. 
	 * If not available, creates one and stores the id in configuration.
	 */
	async getMediaHost() {
		var albumId = this.fileSystemAdapter.getConfigProperty('blogly-dir');
		if (albumId == null) {
			albumId = await this.driveAPI.createDriveFolder(FileSystemConstants.BLOGLY_DIR);
			this.fileSystemAdapter.setConfigProperty('blogly-dir', albumId, true);
		}
		return albumId;
	}

	/**
	 * Uploads a given image raw data to the Blogly drive directory
	 * @param {*} imageData 
	 * @param {*} albumId 
	 */
	async uploadRAWImage(imageData, albumId) {
		// extracts the image type
		var type = imageData.substring(11, imageData.indexOf(";base64"));

		// saves the file to disk for uploading
		var fileDetails = await this.saveImageToDisk(imageData, type);
		var imageStream = this.fileSystemAdapter.readFileStream(fileDetails.fullPath);

		//uploads the image to Google drive and gets its URL
		var image = await this.driveAPI.uploadImage(albumId, fileDetails.fileName, imageStream, type);

		return image.link;
	}

	/**
	 * Saves an image to disk
	 * @param {*} imageData 
	 * @param {*} type 
	 * @returns an object with imageFileName and fullPath
	 */
	saveImageToDisk(imageData, type) {
		var imageFilename;
		var tempPath = this.__getTempDir();

		var fileContents = Buffer.from(imageData.substring(imageData.indexOf(";base64") + ";base64,".length, imageData.length -1),"base64");
		//const blob = base64util.toBlob(imageData.substring(imageData.indexOf(";base64") + ";base64,".length, imageData.length -1));
		var currTime = Math.floor(Date.now());
		imageFilename = 'img_' + currTime + "." + type;
		var filePath = tempPath + path.sep + imageFilename;
		this.fileSystemAdapter.writeToFile(filePath, fileContents);

		return {
			fileName: imageFilename,
			fullPath: filePath
		}
	}
}

module.exports.MediaManagerService = MediaManagerService;