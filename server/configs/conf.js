/**
 * Configurations for the application
 */

class AuthListener {
	constructor() {
		this.listener_port = 9080;
		this.listener_host = 'localhost';
	}
}

class Permissions {
	constructor() {
		this.bloggerScope = 'https://www.googleapis.com/auth/blogger',
		this.driveScope = 'https://www.googleapis.com/auth/drive.file';
	}
}

module.exports.AuthListener = AuthListener;
module.exports.Permissions = Permissions;