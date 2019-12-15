const { GoogleAPIAdapter } = require('./googleapi.adapter');
const { Permissions, URLConstants } = require('../../configs/conf');

/**
 * Adapter for Google Drive API
 * 
 * @author Aswin Rajeev
 */
class DriveAPIAdapter {

	/**
	 * Singleton constructor for DriveAPIAdapter
	 * 
	 * @param {*} args 
	 */
	constructor(args) {

		const defaultInstance = this.defaultInstance ? this.defaultInstance : this.constructor.defaultInstance;
		if (defaultInstance) {

			if (defaultInstance.debugMode) {
				console.debug("Instance already exists. Ignoring the arguments.");
			}

			return defaultInstance;
		}
		
		this.debugMode = args.debugMode;
		
		this.googleAPI = new GoogleAPIAdapter({
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
	 * Generate Drive Auth URL
	 */
	generateAuthUrl() {
		return this.googleAPI.generateAuthUrl([
			Permissions.driveScope
		])
	}

	/**
	 * Creates a folder in Google drive
	 * 
	 * @param {*} folderName 
	 */
	async createDriveFolder(folderName) {
		try {

			// folder meta data
			var fileMetadata = {
				name: folderName,
				mimeType: 'application/vnd.google-apps.folder'
			};

			// creates the folder and fetches folder data
			var dirData = await this.googleAPI.getDriveAPI().files.create({
				resource: fileMetadata,
				fields: 'id'
			});

			return dirData.data.id;
		} catch (error) {
			console.error('Could not create the Google Drive directory.', error);
			throw error;
		}
	}

	/**
	 * Uploads an image to google drive and sets it as public
	 * 
	 * @param {*} albumId 
	 * @param {*} imageFileName 
	 * @param {*} imageStream 
	 * @param {*} imageType 
	 */
	async uploadImage(albumId, imageFileName, imageStream, imageType) {
		try {

			// create file meta data - filename and parent folder
			const fileMetadata = {
				name: imageFileName,
				parents: [albumId]
			};

			// define the file data
			const media = {
				mimeType: 'image/' + imageType,
				body: imageStream
			};
	
			// upload the file
			var resp = await this.googleAPI.getDriveAPI().files.create({
				resource: fileMetadata,
				media: media,
				fields: 'id'
			});
	
			// set visibility as public
			const resource = {"role": "reader", "type": "anyone"};
			var permResult = await this.googleAPI.getDriveAPI().permissions.create(
				{
					fileId:resp.data.id, 
					resource: resource
				}
				//uncomment this is found to be faulty.
				/* , 
				(error, result) => {
					if (error) {
						throw error;
					}
				} */
			);
	
			var imageRef = new Object();
			imageRef.fileId = resp.data.id;
			imageRef.link = URLConstants.DRIVE_URL + imageRef.fileId;
	
			return imageRef;

		} catch (error) {
			console.error('Error in uploading the image.', error);
			throw error;
		}
	}

}

module.exports.DriveAPIAdapter = DriveAPIAdapter;