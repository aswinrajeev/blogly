const { dialog } = require('electron');
const { BlogPost } = require('../models/blogpost');
const { MessageManagerService } = require('./messagemanager.service');
const { FileSystemConstants, ApplicationConfigurations } = require('../../configs/conf');
const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { ServerResponse } = require('../models/response');
const path = require('path');
const h2p = require('html2plaintext');

/**
 * Handler service for blog post events
 * 
 * @author Aswin Rajeev
 */
class PostManagerService {

	/**
	 * Singleton constructor for post manager service
	 * @param {*} args 
	 */
	constructor(args) {
		const defaultInstance = this.defaultInstance;
		if (defaultInstance) {
			if (defaultInstance.debugMode) {
				console.debug('Instance already exists. Ignoring the arguments.');
			}
			return defaultInstance;
		}

		this.debugMode = args.debugMode;

		// get instances for file system adapter and message manager, as those would be already initialized
		this.fileSystemAdapter = FileSystemAdapter.getDefaultInstance();
		this.messageManager = MessageManagerService.getDefaultInstance();

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

		this.initializeListeners();
	}

	/**
	 * Initializes the listener points for communication from the UI
	 */
	initializeListeners() {
		this.messageManager.respond('fetchposts', (blog) => {
			return this.fetchPostsList();
		});

		this.messageManager.respond('fetchFullPost', (file) => {
			return this.fetchPostData(file);
		});

		this.messageManager.respond('savePost', (data) => {
			return this.savePost(data.filename, data.postData);
		});

		this.messageManager.listen('deletePost', (data) => {
			this.deletePost(data.itemId);
		});
	}

	/**
	 * Constructs and returns the full file path for the post file
	 */
	__getPostFilePath(fileName) {
		var blogsDir = this.fileSystemAdapter.getConfigProperty('blogsDir');
		return blogsDir + path.sep + fileName;
	}

	/**
	 * Construct and returns the index file path
	 */
	__getIndexFile() {
		var blogsDir = this.fileSystemAdapter.getConfigProperty('blogsDir');
		var indexFile = blogsDir + path.sep + FileSystemConstants.INDEX_FILE_NAME;
		return indexFile;
	}

	/**
	 * Index the post files in the blogs directory and creates an index file
	 * Returns the index data
	 */
	__indexPosts() {
		var blogs = [];
		var blogIndex = {};
		var count = 0;

		var indexData = {};
		var currTime = Math.floor(Date.now());

		try {

			// read each file in the blogs directory.
			var blogsDir = this.fileSystemAdapter.getConfigProperty('blogsDir');
			var postFiles = this.fileSystemAdapter.getFilesInDir(blogsDir); 
			postFiles.forEach( (file) => {

				var filenameParts = file.split('.');

				// processes only if the file extension matches that of blogly
				if (filenameParts[filenameParts.length - 1] == FileSystemConstants.BLOGLY_FILE_EXTN) {
	
					try {

						// reads the contents of the file
						var postContents = this.fileSystemAdapter.readFromFile(this.__getPostFilePath(file));
						var postObj = JSON.parse(postContents);
						var blogPost = new Object();
		
						blogPost.title = postObj.title;
						blogPost.postId = postObj.postId;
						blogPost.miniContent = h2p(postObj.content).slice(0, 100); //updates only the mini-content. The original content is retrieved later.
						blogPost.filename = file; //TODO: Make the file/filename attribute consistent
		
						// used for generation of index for the current blog post, and set it as the item id for the post
						var timestamp = 'p_' + currTime;
						currTime = currTime + 1;
						blogPost.itemId = timestamp;
						
						// rewrite the post data with itemId
						postObj.itemId = timestamp;
						//TODO: Call save blog post method
		
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
			this.fileSystemAdapter.writeToFile(this.__getIndexFile(), JSON.stringify(indexData));
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
		
		var posts = [];
		var response;

		try {
			var indexData = {};
	
			try {
				
				// reads content of the index file
				var content = this.fileSystemAdapter.readFromFile(this.__getIndexFile());
				indexData = JSON.parse(content);
			} catch (error) {
				console.error('Error in reading indices. Regenerating the indices...', error);
				try {
					indexData = this.__indexPosts();
				} catch (error) {
					console.error('Error in indexing the posts in the workspace', error);
					return null; //TODO: Replace this flow with success codes
				}
			}
	
			indexData.posts.forEach(itemId => {
				var post = indexData.index[itemId];
				post.itemId = itemId;
				posts.push(post);
			})

			// returns success response with posts
			response = new ServerResponse({
				posts: posts
			}).ok();
			return response;

		} catch (error) {
			console.error('Unable to fetch the blog posts.', error);
			response = new ServerResponse().failure();
			return response;
		}
	}

	/**
	 * Fetches the post data from the file provided.
	 * @param {*} file - file path for the blogly post
	 */
	fetchPostData(file) {
		var postObj;
		var post;
		var response;

		try {

			// read the content of the post file
			var postContent = this.fileSystemAdapter.readFromFile(this.__getPostFilePath(file));
			postObj = JSON.parse(postContent);

			// add filename on to the data
			postObj.filename = file;
			
			post = new BlogPost(postObj);

			response = new ServerResponse({
				post: post.toJSON()
			}).ok();

			return response;

		} catch (error) {
			console.error('Error in reading the post file.', error);
			response = new ServerResponse().failure();
			return response;
		}
	}

	/**
	 * Writes the post data into the file specified by filename.
	 * @param {*} fileName - filename for the file to which the post data is to be written
	 * @param {*} postObj - the post data 
	 */
	savePost(fileName, postObj) {

		var post = new BlogPost(postObj);
		var response;
		
		// sets the itemId if found to be null
		if (post.itemId == null || post.itemId.trim() == '' ) {
			var currTime = Math.floor(Date.now());
			var timestamp = 'p_' + currTime;
			post.itemId = timestamp;
		}

		try {

			// generates the file name if not specified
			if (fileName == null || fileName == 'undefined') {
				var blogsDir = this.fileSystemAdapter.getConfigProperty('blogsDir');
				fileName =  this.fileSystemAdapter.generateFileName(post.title, FileSystemConstants.BLOGLY_FILE_EXTN, blogsDir);
			}
			post.file = fileName;

			// writes the post data into the file
			this.fileSystemAdapter.writeToFile(this.__getPostFilePath(fileName), JSON.stringify(post.toJSON()));
		} catch (error) {
			console.error('Unable to write the post data to file.', error);
			response = new ServerResponse().failure();
			return response;
		}

		try {
			var indexContents =  this.fileSystemAdapter.readFromFile(this.__getIndexFile());
			if (indexContents != null && indexContents.trim() != '') {
				var indexData = JSON.parse(indexContents);
				var blogPost = indexData.index[post.itemId];
				if (blogPost == null) {
					blogPost = indexData.index[post.itemId] = new Object();	
				}

				blogPost.title = post.title;
				blogPost.postId = post.postId;
				blogPost.miniContent = h2p(post.content).slice(0, 100); //updates only the mini-content. The original content is retrieved later.
				blogPost.filename = fileName;

				// add post itemId to the index posts
				var posts = indexData.posts;
				if (posts == null) {
					posts = indexData.posts = [];
				}
				if (posts.indexOf(post.itemId) < 0) {
					// add post to the begining
					posts.splice(0, 0, post.itemId);
				}
			
				// updates the index file
				this.fileSystemAdapter.writeToFile(this.__getIndexFile(), JSON.stringify(indexData));
			}

			// returns success message with fileName and post data
			response = new ServerResponse({
				filename: fileName,
				data: post.toJSON()
			}).ok();
			return response;
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
			response = new ServerResponse().failure();
			return response;
		}
	}

	/**
	 * Deletes the post from the index data and from the file system
	 * @param {*} itemId - id of the blog post to be deleted
	 */
	deletePost(itemId) {
		try {
			dialog.showMessageBox ({
				type: 'info',
				buttons: ['Delete', 'Cancel'],
				message: 'Are you sure to delete the post?',
				title: 'Confirm'
			}, (result) => {
				if (result == 0) {
					var response;

					var indexData;
					var postData;
					var file;
					var indexFile = this.__getIndexFile();

					try {
						// reads content of the index file
						var content = this.fileSystemAdapter.readFromFile(indexFile);
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
							this.fileSystemAdapter.writeToFile(indexFile, JSON.stringify(indexData), "utf8");

							try {
								// delete the physical file
								if (file != null && file.trim() != ''){
									var postFile = this.__getPostFilePath(file);
									this.fileSystemAdapter.deleteFile(postFile);
								}
							} catch (error) {
								console.error('Could not delete the blog post file.', error);
							}

							// sends a success status
							response = new ServerResponse().ok();
							this.messageManager.send('deleted' + itemId, response);
						} else {

							// sends a failure status
							response = new ServerResponse().failure();
							this.messageManager.send('deleted' + itemId, response);
						}
					} catch (error) {
						console.error('Could not delete the blog post.', error);

						// sends a failure status
						response = new ServerResponse().failure();
						this.messageManager.send('deleted' + itemId, response);
					}
				}
			});
		} catch (error) {
			console.error('Error in deleting the blog post.', error);
			// sends a failure status
			response = new ServerResponse().failure();
			this.messageManager.send('deleted' + itemId, response);
		}
	}
}

module.exports.PostManagerService = PostManagerService;