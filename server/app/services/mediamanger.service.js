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

	/**
	 * Returns the image directory for the blogs.
	 * Creates the directory if it does not exists.
	 */
	getImageDir() {
		try {
			var blogsDir = this.fileSystemAdapter.getConfigProperty('blogsDir');
			var temp =  blogsDir + path.sep + FileSystemConstants.IMAGE_DIR ;
			
			// creates the temp dir if it does not exist
			this.fileSystemAdapter.createDir(temp);
			return temp;
		} catch (error) {
			console.error("Error creating temp directory.", error);
			throw error;
		}
	}

	/**
	 * Constructs and returns the path to image map file
	 */
	__getImageMapFile() {
		return this.getImageDir() + path.sep + FileSystemConstants.IMAGE_MAP_FILE;
	}

	/**
	 * Reads and returns the image map from the imaage map file
	 */
	__getImageMap() {
		try {
			var imgMapFile = this.__getImageMapFile();
			var imgMap = {
				localToRemote: {
	
				}
			}
			var imgMapString  = this.fileSystemAdapter.readFromFile(imgMapFile, JSON.stringify(imgMap));
			imgMap = JSON.parse(imgMapString);

			return imgMap;
		} catch (error) {
			console.error("Could not fetch the image map.", error);
			throw error;
		}
	}

	getMappedRemoteImage(localImage) {
		try {
			var imgMap = this.__getImageMap();
			return imgMap.localToRemote[localImage];
		} catch (error) {
			console.error("Could not get the image mapping for the local file.", error);
			throw error;
		}
	}

	__saveImageMapping(localImage, remoteImage) {
		var imgMap = this.__getImageMap();
		var imgMapFile = this.__getImageMapFile();

		imgMap.localToRemote[localImage] = remoteImage;
		this.fileSystemAdapter.writeToFile(imgMapFile, JSON.stringify(imgMap));
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
	 * Saves a given image raw data to the file system and then uploads to Blogly drive directory
	 * @param {*} imageData 
	 * @param {*} albumId 
	 */
	async uploadRAWImage(imageData, albumId) {
		try {
			// extracts the image type
			var type = imageData.substring(11, imageData.indexOf(";base64"));
	
			// saves the file to disk for uploading
			var fileDetails = await this.saveImageToDisk(imageData);
	
			// uploads the file to the blogly directory
			await this.uploadImageFromFile(fileDetails.fileName, fileDetails.fullPath, albumId, type);
			
			return fileDetails.fileName;
		} catch (error) {
			console.error('Could not update the image data.', error);
			throw error;
		}
	}

	/**
	 * Uploads an image from the file system and returns the link
	 * @param {*} fileName 
	 * @param {*} filePath 
	 * @param {*} albumId 
	 * @param {*} type 
	 */
	async uploadImageFromFile(fileName, filePath, albumId) {
		try {
			var imageStream = this.fileSystemAdapter.readFileStream(filePath);
	
			var fileParts = filePath.split('.');
			if (fileParts.length < 2) {
				throw new Error("Invalid image file type.");
			}
	
			var type = fileParts[fileParts.length - 1];
	
			//uploads the image to Google drive and gets its URL
			var image = await this.driveAPI.uploadImage(albumId, fileName, imageStream, type);
	
			// cache the image mapping
			this.__saveImageMapping(fileName, image.link);
	
			return image.link;
		} catch (error) {
			console.error('Could not update the content images.', error);
			throw error;
		}
	}

	/**
	 * Saves an image to disk
	 * @param {*} imageData 
	 * @param {*} type 
	 * @returns an object with imageFileName and fullPath
	 */
	saveImageToDisk(imageData) {
		try {
			var imageFilename;
			var tempPath = this.getImageDir();
			
			// extracts the image type
			var type = imageData.substring(11, imageData.indexOf(";base64"));
	
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
		} catch (error) {
			console.error('Could not save the image to disk', error);
			throw error;
		}
	}
}

module.exports.MediaManagerService = MediaManagerService;