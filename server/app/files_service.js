const fs = require('fs');
const path = require('path');
const h2p = require('html2plaintext');
const base64util = require('based-blob');

/**
 * @author Aswin Rajeev
 * 
 * The file system service for blogly. All file system I/O operations are handled through this service.
 */
class FileSystemService {

	constructor(app) {

		this.BLOGLY_FILE_EXTN = "blogly";
		this.INDEX_FILE_NAME = ".blogly.index";
		this.imageIndex = 0;

		// define the file system properties and initializes the required properties.
		this.appDir = app.getPath('appData') + path.sep + "blogly"; //define the app dir
		this.appConf = this.appDir  + path.sep +  "config.json";

		this.blogsDir = null;
		this.conf = null;
		this.indexFileName = this.INDEX_FILE_NAME;
	}

	/**
	 * Initializes the filesystem service. This includes the following.
	 * - reading the configurations from the app dir
	 * - over-riding the default blog directory if defined
	 *  */
	initalize() {
		this.conf = this.readConfigs();
		this.blogsDir = this.conf.blogsDir;
	}

	/**
	 * Initializes the configuration for the first time. 
	 */
	initializeConfig() {

		// initial window size
		var conf = {
			windowWidth: 1080, 
			windowHeight: 640,
		};

		// initializes the blog directory as Blogly folder in documents.
		conf.blogsDir = app.getPath('documents') + path.sep + 'Blogly';

		try {

			// creates the app directory if it does not exist
			if (!fs.existsSync(this.appDir)) {
				fs.mkdirSync(this.appDir);
			}

			//creates the blog directory
			if (!fs.existsSync(this.blogsDir)){
				fs.mkdirSync(this.blogsDir);
			}
	
			// store the conf into a config file in the user app dir
			fs.writeFileSync(this.appConf, JSON.stringify(conf), "utf8");

			return conf;
		} catch (error) {
			console.error("Could not create the configuration file. Please check if the application has sufficient permissions to read/write in the application data directory.", error);
			throw error;
		}
	}

	/**
	 * Get the index file path for the blog directory
	 */
	getIndexFile() {
		return this.blogsDir + path.sep + this.indexFileName;
	}

	/**
	 * Constructs and provide the fully qualified filepath from the filename
	 * @param {*} filename - the file name for the file in question
	 */
	getFilePath(filename) {
		return this.blogsDir + path.sep + filename;
	}

	getTemplPath() {
		try {
			var temp =  this.appDir + path.sep + "_temp";
			if (!fs.existsSync(temp)) {
				fs.mkdirSync(temp);
			}
			return temp;
		} catch (error) {
			console.error("Error creating temp directory.", error);
			throw error;
		}
	}

	/**
	 * Reads the configuration from the app directory and returns it.
	 */
	readConfigs() {

		try {
			// reads the configurations for the app directory and returns the configuration
			return JSON.parse(fs.readFileSync(this.appConf));
		} catch (error) {
			console.debug("Unable to load the conf file.")
			try {
				// do a first-time initialization, and returns the initial configuration
				var conf = this.initializeConfig();
				return conf;
			} catch (error) {
				console.error("Cannot create the configuration file.", error);
				throw error;
			}
		}
	}

	/**
	 * Writes the configuration into the filesystem.
	 * @param {*} conf - configuration object to be saved.
	 */
	saveConfigs(conf) {
		try {
			fs.writeFileSync(this.appConf, JSON.stringify(conf), "utf8");
		} catch (error) {
			console.error("Cannot create the configuration file.", error);
			throw error;
		}
	}

	/**
	 * Reads a property from configuration by its key.
	 * @param {*} key - key of the configuration property to read
	 */
	getConfigProperty(key) {
		if (this.conf != null) {
			return this.conf[key];
		} else {
			return null;
		}
	}

	/**
	 * Sets a configuration property identified by key with the value.
	 * Writes the configuration to the filesystem if writeConf is true.
	 * @param {*} key - key of the configuration entry
	 * @param {*} value - value for the configuration entry
	 * @param {*} writeConf - specifies if the configuration has to be immediately written into the filesystem.
	 */
	setConfigProperty(key, value, writeConf) {

		// initializes the config if it doesn't exist
		if (this.conf == null) {
			this.conf = this.readConfigs();
		}

		// sets the property corresponding to the key with value
		this.conf[key] = value;

		if (writeConf == true) {
			this.saveConfigs(this.conf);
		}
	}

	/**
	 * Sets the messenger object for the filesystem service. Messenger is used to provide log entries to the application from the filesystem service.
	 * @param {*} messenger - the initialized messenger object
	 */
	setMessenger(messenger) {
		this.messenger = messenger;
	}

	/**
	 * Creates/over-writes an index for the current blogs directory.
	 */
	indexPosts() {
		var blogs = [];
		var blogIndex = {};
		var count = 0;

		var indexData = {};
		var currTime = Math.floor(Date.now());

		try {

			// read each file in the blogs directory.
			fs.readdirSync(this.blogsDir).forEach( (file) => {

				var filenameParts = file.split('.');

				// processes only if the file extension matches that of blogly
				if (filenameParts[filenameParts.length - 1] == this.BLOGLY_FILE_EXTN) {
	
					try {
						var blogPost = new Object();
		
						// reads the contents of the file
						var post = JSON.parse(fs.readFileSync(this.getFilePath(file), "utf8"));
						
						blogPost.title = post.title;
						blogPost.postId = post.id;
						blogPost.miniContent = h2p(post.content).slice(0, 100); //updates only the mini-content. The original content is retrieved later.
						blogPost.filename = file;
		
						// used for generation of index for the current blog post, and set it as the item id for the post
						var timestamp = 'p_' + currTime;
						currTime = currTime + 1;
						blogPost.itemId = timestamp;
						
						// rewrite the post data with itemId
						post.itemId = timestamp;
						this.savePost(file, post);
		
						blogIndex[timestamp] = blogPost;
						blogs.push(timestamp);
		
						count = count + 1;
					} catch (error) {
						console.error('Error in reading the blog data.', error);
					}
				}
			});
	
			indexData.index = blogIndex;
			indexData.posts = blogs;
			indexData.count = count;
	
			// writes the index data into the index file
			fs.writeFileSync(this.getIndexFile(), JSON.stringify(indexData), "utf8");
		} catch (error) {
			console.error('Error in indexing the posts.', error);
			throw error;
		}

		return indexData;

	}

	/**
	 * Fetches the posts as specified in the current blogs index file.
	 */
	fetchPostsList() {
		
		var indexData = {};

		try {
			//indexData = this.indexPosts(); //TODO: Remove this

			// reads content of the index file
			var content = fs.readFileSync(this.getIndexFile(), "utf8");
			indexData = JSON.parse(content);
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
			indexData = this.indexPosts();
		}

		var posts = [];
		indexData.posts.forEach(itemId => {
			var post =indexData.index[itemId];
			post.itemId = itemId;
			posts.push(post);
		})

		return posts;
	}

	/**
	 * Deletes the post from the index data and from the file system
	 * @param {*} itemId - id of the blog post to be deleted
	 */
	deletePost(itemId) {
		var indexData;
		var postData;
		var file;

		try {
			// reads content of the index file
			var content = fs.readFileSync(this.getIndexFile(), "utf8");
			indexData = JSON.parse(content);
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
		}
		try {	
			if (indexData != null) {
				postData = indexData.index[itemId];
				file = postData.filename;
	
				// delete the entry from the index
				delete indexData.index[itemId];
				indexData.posts.splice(indexData.posts.indexOf(itemId), 1);
				
				// writes the index data into the index file
				fs.writeFileSync(this.getIndexFile(), JSON.stringify(indexData), "utf8");

				try {
					// delete the physical file
					if (file != null && file.trim() != ''){
						fs.unlinkSync(this.getFilePath(file));
					}
				} catch (error) {
					console.error('Could not delete the blog post file.', error);
				}

				return true;
			}
			return false;
		} catch (error) {
			console.error('Could not delete the blog post.', error);
			throw error;
		}
	}

	/**
	 * Fetches the post data from the file provided.
	 * @param {*} file - file path for the blogly post
	 */
	fetchPostData(file) {
		var postData;

		try {

			// read the content of the post file
			var content = fs.readFileSync(this.getFilePath(file), "utf8");
			postData = JSON.parse(content);

			// add filename on to the data
			postData.file = file;
		} catch (error) {
			console.error('Error in reading the post file.', error);
			throw error;
		}

		return postData;
	}

	/**
	 * Generates a filename based on the title.
	 * @param {*} title 
	 */
	generateFileName(title) {
		var fileName = title.split(' ').join('_');
		var index = 1;

		fileName = fileName.length > 8 ? fileName.substring(0, 15) : fileName;

		// continue incrementing the number till no files with the same name found
		while (fs.existsSync(this.getFilePath(fileName) + '.' + this.BLOGLY_FILE_EXTN )) {
			fileName = fileName + ++index;
		}

		return fileName + '.' + this.BLOGLY_FILE_EXTN;
	}

	/**
	 * Writes the post data into the file specified by filename.
	 * @param {*} fileName - filename for the file to which the post data is to be written
	 * @param {*} post - the post data 
	 */
	savePost(fileName, post) {

		var postData = {};
		postData.content = post.content;
		postData.title = post.title;
		postData.itemId = post.itemId;
		postData.postId = post.postId
		postData.file = post.file;
		postData.postURL = post.postURL;
		
		// sets the itemId if found to be null
		if (postData.itemId == null || postData.itemId.trim() == '' ) {
			var currTime = Math.floor(Date.now());
			var timestamp = 'p_' + currTime;
			postData.itemId = timestamp;
		}

		try {

			// generates the file name if not specified
			if (fileName == null || fileName == 'undefined') {
				fileName = this.generateFileName(postData.title);
			}
			postData.file = fileName;

			// writes the post data into the file
			fs.writeFileSync(this.getFilePath(fileName), JSON.stringify(postData));
		} catch (error) {
			console.error('Unable to write the post data to file.', error);
		}

		try {
			var indexContents = fs.readFileSync(this.getIndexFile(), "utf8");
			if (indexContents != null && indexContents.trim() != '') {
				var indexData = JSON.parse(indexContents);
				var blogPost = indexData.index[postData.itemId];
				if (blogPost == null) {
					blogPost = indexData.index[postData.itemId] = new Object();	
				}

				blogPost.title = postData.title;
				blogPost.postId = postData.postId;
				blogPost.miniContent = h2p(postData.content).slice(0, 100); //updates only the mini-content. The original content is retrieved later.
				blogPost.filename = fileName;

				// add post itemId to the index posts
				var posts = indexData.posts;
				if (posts == null) {
					posts = indexData.posts = [];
				}
				if (posts.indexOf(postData.itemId) < 0) {
					posts.splice(0, 0, postData.itemId);
				}
			
				fs.writeFileSync(this.getIndexFile(), JSON.stringify(indexData));
			}
			return {
				fileName: fileName,
				data: postData,
				status: 200
			};
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
			return {
				status: 0
			}
		}

	}

	async saveImage(imageData, type) {
		var imageFilename;
		var tempPath = this.getTemplPath();

		var fileContents = Buffer.from(imageData.substring(imageData.indexOf(";base64") + ";base64,".length, imageData.length -1),"base64");
		//const blob = base64util.toBlob(imageData.substring(imageData.indexOf(";base64") + ";base64,".length, imageData.length -1));
		var currTime = Math.floor(Date.now());
		imageFilename = 'img_' + currTime + "." + type;
		var fullFileName = tempPath + path.sep + imageFilename;
		fs.writeFileSync(fullFileName, fileContents);

		return {
			imageFileName: imageFilename,
			path: fullFileName
		}
	}

	getFileReadStream(file) {
		return fs.createReadStream(file);
	}

}

module.exports.FileSystemService = FileSystemService;