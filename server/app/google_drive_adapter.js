const {google} = require('googleapis');

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

	initialize(args) {
		this.authClient.setCredentials(args.tokens);
	}

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

	async uploadImage(albumId, imageFileName, imageStream, type) {
		const fileMetadata = {
			name: imageFileName,
			parents: [albumId]
		};
		const media = {
			mimeType: 'image/' + type,
			body: imageStream
		};

		var resp = await this.drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: 'id'
		});
	}

}

module.exports.GoogleDriveAdapter = GoogleDriveAdapter;