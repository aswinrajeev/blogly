const fs = require('fs');
const path = require('path');
const h2p = require('html2plaintext');

class FileSystemService {

	constructor(app) {
		this.appDir = app.getPath('appData') + path.sep + "blogly"; //define the app dir
		this.appConf = this.appDir  + path.sep +  "config.json";
		this.blogsDir = app.getPath('documents') + path.sep + 'Blogly'; //set default blogs document dir
		this.conf = null;
		this.indexFileName = ".blog.index";
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

		this.messenger.respond('fetchFullPost', (data) => {
			return this.fetchPostData(data.filename);
		});

		this.messenger.respond('savePost', (data) => {
			return this.savePost(data.filename, data.postData);
		})
	}

	// creates / overwrites the indexing data
	indexPostsFiles() {
		var blogs = [];
		var blogIndex = {};
		var count = 0;

		var indexData = {};
		var currTime = Math.floor(Date.now());

		try {
			fs.readdirSync(this.blogsDir).forEach((file) => {
				var filenameParts = file.split('.');
				if (filenameParts[filenameParts.length - 1] == "post") {
	
					try {
						var blogPost = new Object();
		
						var post = JSON.parse(fs.readFileSync(this.blogsDir + path.sep + file, "utf8"));
						
						blogPost.title = post.title;
						blogPost.postId = post.id;
						blogPost.miniContent = h2p(post.content).slice(0, 100);
						blogPost.filename = file;
		
						var timestamp = 'p_' + currTime;
						currTime = currTime + 1;

						blogPost.itemId = timestamp;
		
						blogIndex[timestamp] = blogPost;
						blogs.push(timestamp);
		
						count = count + 1;
					} catch (error) {
						console.debug('Error in reading the blog data');
					}
				}
			});
	
			indexData.index = blogIndex;
			indexData.posts = blogs;
			indexData.count = count;
	
			fs.writeFileSync(this.blogsDir + path.sep + this.indexFileName, JSON.stringify(indexData), "utf8");
		} catch (error) {
			console.error('Error in indexing the posts.');
		}

		return indexData;

	}

	// reads the post details from the index and returns the list
	getPostsList() {
		
		var indexData = {};

		try {
			indexData = this.indexPostsFiles(); //TODO: Remove this
			var content = fs.readFileSync(this.blogsDir + path.sep + this.indexFileName, "utf8");
			indexData = JSON.parse(content);
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
			indexData = this.indexPostsFiles();
		}

		var posts = [];
		indexData.posts.forEach(itemId => {
			posts.push(indexData.index[itemId]);
		})

		return posts;
	}

	// reads the post file for a post and return the complete data
	fetchPostData(file) {
		var postData;

		try {
			var content = fs.readFileSync(this.blogsDir + path.sep + file, "utf8");
			postData = JSON.parse(content);

			// add filename on to the data
			postData.file = file;
		} catch (error) {
			console.error('Error in reading the post file.', error);
		}

		return postData;
	}

	// writes the post data to the corresponding file
	savePost(filename, post) {

		var postData = {};
		var result = {status: 'ok'};
		postData.content = post.content;
		postData.title = post.title;
		postData.itemId = post.itemId;
		postData.postId = post.postId
		postData.file = post.file;
		postData.postURL = post.postURL;
		fs.writeFileSync(this.blogsDir + path.sep + filename, JSON.stringify(postData));

		// TODO: Update the cache also

		result.filename = filename;

		return result;
	}



}

module.exports.FileSystemService = FileSystemService;