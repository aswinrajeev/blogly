const {google} = require('googleapis');

/**
 * Adapter for Google Drive API.
 * Used for uploading images in blog posts.
 * @author Aswin Rajeev
 */
class GoogleDriveAdapter {

	constructor(args) {
		this.drive = null;

		// backup the app configurations
		this.appConf = args.appConf;
		this.debugMode = args.debugMode;

		// create a google API authenticator
		this.authClient = new google.auth.OAuth2(
			args.apiConf.client_id,
			args.apiConf.client_secret,
			`http://${this.appConf.listener_host}:${this.appConf.listener_port}`
		);

		this.tokens = null;

		this.drive = google.drive({
			version: 'v3',
			auth: this.authClient
		});

		if (this.debugMode) {
			console.debug('Drive API initialized.');
		}
	}

	/**
	 * Initializes the adapter
	 * 
	 * @param {*} args 
	 */
	initialize(args) {
		this.authClient.setCredentials(args.tokens);
	}

	/**
	 * Creates a folder in Google drive for Blogly
	 * @param {*} folderName 
	 */
	async createFolder(folderName) {
		try {
			var fileMetadata = {
				'name': folderName,
				'mimeType': 'application/vnd.google-apps.folder'
			};
			var resp = await this.drive.files.create({
				resource: fileMetadata,
				fields: 'id'
			});
			return resp.data.id;
		} catch (error) {
			console.error('Could not create the Google Drive directory.', error);
			throw error;
		}
	}

	/**
	 * Uploads an image to google drive and sets it as public
	 * @param {*} albumId 
	 * @param {*} imageFileName 
	 * @param {*} imageStream 
	 * @param {*} type 
	 */
	async uploadImage(albumId, imageFileName, imageStream, type) {
		const fileMetadata = {
			name: imageFileName,
			parents: [albumId]
		};
		const media = {
			mimeType: 'image/' + type,
			body: imageStream
		};

		// upload the file
		var resp = await this.drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: 'id'
		});

		// set visibility as public
		const resource = {"role": "reader", "type": "anyone"};
		await this.drive.permissions.create({fileId:resp.data.id, resource: resource}, (error, result)=>{
			if (error) {
				throw error;
			}
		});

		var out = new Object();
		out.fileId = resp.data.id;
		out.link = 'https://drive.google.com/uc?export=view&id=' + out.fileId;

		return out;
	}

}

module.exports.GoogleDriveAdapter = GoogleDriveAdapter;