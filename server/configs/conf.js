/**
 * Configurations for the application
 */

module.exports.AuthListener = { };
module.exports.AuthListener.LISTENER_PORT = 9080;
module.exports.AuthListener.LISTENER_HOST = 'localhost';

module.exports.Permissions = { };
module.exports.Permissions.BLOGGER_SCOPE = 'https://www.googleapis.com/auth/blogger',
module.exports.Permissions.DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

module.exports.FileSystemConstants = { };
module.exports.FileSystemConstants.APP_DIR = "appData";
module.exports.FileSystemConstants.DOCS_DIR = "documents"
module.exports.FileSystemConstants.BLOGLY_APP_DIR = "blogly";
module.exports.FileSystemConstants.CONFIG_FILE = "config.json";
module.exports.FileSystemConstants.BLOGLY_FILE_EXTN = ".blogly";
module.exports.FileSystemConstants.INDEX_FILE_NAME = ".blogly.index";
module.exports.FileSystemConstants.BLOGLY_DIR = "Blogly";

module.exports.URLConstants = { };
module.exports.URLConstants.DRIVE_URL = "https://drive.google.com/uc?export=view&id=";

module.exports.ApplicationConfigurations = { };
module.exports.ApplicationConfigurations.MIN_WIDTH = 1080;
module.exports.ApplicationConfigurations.MIN_HEIGHT = 618;
module.exports.ApplicationConfigurations.BACKGROUND_COLOR = "rgb(55, 55, 55)";