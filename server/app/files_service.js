const fs = require('fs');
const path = require('path');

class FileSystemService {

	constructor(app) {
		this.appDir = app.getPath('appData') + path.sep + "blogly"; //define the app dir
		this.appConf = this.appDir  + path.sep +  "config.json";
		this.blogsDir = app.getPath('documents') + path.sep + 'Blogly'; //set default blogs document dir
		this.conf = null;
	}

	// load the configurations for the application
	initalize() {
		this.conf = this.readConfigs();
		this.blogsDir = this.conf.blogsDir;
	}

	// first-time initialize all pre-requisites
	initializeConfig() {
		var conf = {
			width: 1080, 
			height: 640,
		};
		conf.blogsDir = this.blogsDir;

		try {
			if (!fs.existsSync(this.appDir)) {
				fs.mkdirSync(this.appDir);
			}
			if (!fs.existsSync(this.blogsDir)){
				fs.mkdirSync(this.blogsDir);
			}
	
			// store the conf into a config file in the user app dir
			fs.writeFileSync(this.appConf, JSON.stringify(conf), "utf8");
		} catch (error) {
			console.error("Cannot create the configuration file.");
		}


	}

	// returns the configuratins
	readConfigs() {
		try {
			return JSON.parse(fs.readFileSync(this.appConf));
		} catch (error) {
			console.debug("Unable to load the conf file.")
			try {

				//do a first-time initialization
				this.initializeConfig();
				return JSON.parse(fs.readFileSync(this.appConf));
			} catch (error) {
				console.error("Cannot create the configuration file.");
				throw error;
			}
		}
	}

	// save the configurations
	saveConfigs(conf) {
		try {
			fs.writeFileSync(this.appConf, JSON.stringify(conf), "utf8");
		} catch (error) {
			console.error("Cannot create the configuration file.");
		}
	}

	// returns a property value
	getProperty(name) {
		if (this.conf != null) {
			return this.conf[name];
		} else {
			return null;
		}
	}

	// sets the messenger
	setMessenger(messenger) {
		this.messenger = messenger;
		this.messenger.respond('fetchposts', (data) => {
			return this.getPostsList();
		});
	}

	// get the list of blogs saved in the blogs directory
	getPostsList() {
		var blogs = [];
		fs.readdirSync(this.blogsDir).forEach((file) => {
			var filenameParts = file.split('.');
			if (filenameParts[filenameParts.length - 1] == "post") {
				var blogPost = {};

				var post = JSON.parse(fs.readFileSync(this.blogsDir + path.sep + file, "utf8"));
				
				blogPost.title = post.title;
				blogPost.content = post.content.slice(0, 25);
				blogPost.file = file;
				blogs.push(blogPost);
			}
		});
		return blogs;
	}



}

module.exports.FileSystemService = FileSystemService;