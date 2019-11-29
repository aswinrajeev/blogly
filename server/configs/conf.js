/**
 * Configurations for the application
 */

class AuthListener {
	constructor() {
		this.LISTENER_PORT = 9080;
		this.LISTENER_HOST = 'localhost';
	}
}

class Permissions {
	constructor() {
		this.BLOGGER_SCOPE = 'https://www.googleapis.com/auth/blogger',
		this.DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
	}
}

class FileSystemConstants {
	constructor() {
		
		this.APP_DIR = "appData";
		this.DOCS_DIR = "documents"

		this.BLOGLY_APP_DIR = "blogly";
		this.CONFIG_FILE = "config.json";
		this.BLOGLY_FILE_EXTN = ".blogly";
		this.INDEX_FILE_NAME = ".blogly.index";

		this.BLOGLY_DIR = "Blogly";

	}
}

module.exports.AuthListener = AuthListener;
module.exports.Permissions = Permissions;
module.exports.FileSystemConstants = FileSystemConstants;