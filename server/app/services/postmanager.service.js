const { dialog } = require('electron');
const { BlogPost } = require('../models/blogpost');
const { MessageManagerService } = require('./messagemanager.service');
const { AuthManagerService } = require('./authmanager.service');
const { FileSystemConstants, Permissions } = require('../../configs/conf');
const { MediaManagerService } = require('./mediamanger.service');
const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { BloggerAPIAdapter } = require('../adapters/blggerapi.adapter');
const { GoogleAPIAdapter } = require('../adapters/googleapi.adapter');
const { ServerResponse } = require('../models/response');
const path = require('path');
const h2p = require('html2plaintext');
const { DOMParser } = require('xmldom');
const beautify = require('js-beautify').html;

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
		const defaultInstance = this.defaultInstance ? this.defaultInstance : this.constructor.defaultInstance;
		if (defaultInstance) {
			if (defaultInstance.debugMode) {
				console.debug('Instance already exists. Ignoring the arguments.');
			}
			return defaultInstance;
		}

		this.debugMode = args.debugMode;
		this.appManager = args.appManager;

		// get instances for file system adapter and message manager, as those would be already initialized
		this.fileSystemAdapter = FileSystemAdapter.getDefaultInstance();
		this.messageManager = MessageManagerService.getDefaultInstance();

		this.googleAPI = new GoogleAPIAdapter({
			debugMode: this.debugMode
		});

		this.bloggerAPI = new BloggerAPIAdapter({
			debugMode: this.debugMode
		});

		this.authManager = new AuthManagerService({
			debugMode: this.debugMode,
			appManager: this.appManager
		});

		this.mediaManager = new MediaManagerService({
			debugMode: this.debugMode,
			appManager: this.appManager
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
			return this.respondToSave(data.filename, data.postData);
		});

		this.messageManager.listen('deletePost', (data) => {
			this.deletePost(data.itemId);
		});

		this.messageManager.listen('publishblog', (data) => {
			if (data != null && data.blog != null) {
				this.publishPostToBlog(data.blog.url, data.postData, data.fileName, false);
			} else {
				var response = new ServerResponse().failure();
				this.messageManager.send('published', response);

				this.appManager.updateStatus(false, 'Could not publish');
			}
		});

		this.messageManager.listen('publishdraft', (data) => {
			if (data != null && data.blog != null) {
				this.publishPostToBlog(data.blog.url, data.postData, data.fileName, true);
			} else {
				var response = new ServerResponse().failure();
				this.messageManager.send('published', response);
				this.appManager.updateStatus(false, 'Could not draft');
			}
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
	 * Constructs and returns the full file path for a local image
	 * @param {*} fileName 
	 */
	__getLocalImagePath(fileName) {
		var imgPath = this.mediaManager.getImageDir() + path.sep + fileName;
		return imgPath;
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

			this.appManager.updateStatus(true, 'Indexing the posts...');

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

			this.appManager.updateStatus(false, 'Indexing completed');
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

		this.appManager.updateStatus(true, 'Loading posts...');
		
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
					response = new ServerResponse().failure();
					this.appManager.updateStatus(false, 'Failed to read indices');
					return response;
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
			this.appManager.updateStatus(false, 'Done');
			return response;


		} catch (error) {
			console.error('Unable to fetch the blog posts.', error);
			response = new ServerResponse().failure();
			this.appManager.updateStatus(false, 'Could not load the post');
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

		this.appManager.updateStatus(true, 'Fetching post data...');

		try {

			// read the content of the post file
			var postContent = this.fileSystemAdapter.readFromFile(this.__getPostFilePath(file));
			postObj = JSON.parse(postContent);

			// add filename on to the data
			postObj.filename = file;

			// loads the raw image data for the local images
			var fullContent = this.loadRAWImages(postObj.content);
			
			post = new BlogPost(postObj);

			response = new ServerResponse({
				post: post.toJSON(),
				fullContent: fullContent
			}).ok();

			this.appManager.updateStatus(false, 'Done');
			return response;

		} catch (error) {
			console.error('Error in reading the post file.', error);
			response = new ServerResponse().failure();
			this.appManager.updateStatus(false, 'Could not read the post');
			return response;
		}
	}

	respondToSave(fileName, postObj) {
		var response;
		try {
			var result = this.savePost(fileName, postObj);

			// returns success message with fileName and post data
			response = new ServerResponse(result).ok();
			this.appManager.updateStatus(false, 'Saved');
			return response;
		} catch (error) {
			response = new ServerResponse().failure();
			this.appManager.updateStatus(false, 'Could not save');
			return response;
		}
	}

	/**
	 * Writes the post data into the file specified by filename.
	 * @param {*} fileName - filename for the file to which the post data is to be written
	 * @param {*} postObj - the post data 
	 */
	savePost(fileName, postObj) {

		this.appManager.updateStatus(true, 'Saving post...');

		var post = new BlogPost(postObj);
		var response;

		// removes all the RAW (base64) images in the content after saving to images directory
		var localContents = this.saveAndRemoveRAWImages(post.content);
		post.content = beautify(localContents);
		
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

			// loads all the local images to the respective img tags
			var fullContent = this.loadRAWImages(post.content);

			// returns success message with fileName and post data
			response = {
				filename: fileName,
				data: post.toJSON(),
				fullContent: fullContent
			};
			return response;
		} catch (error) {
			console.error('Error in reading indices. Regenerating the indices...', error);
			throw error;
		}
	}

	exportPost(post) {
		this.appManager.updateStatus(true, 'Exporting the post...');

		var fileName;
		var postData = post;
	}

	/**
	 * Deletes the post from the index data and from the file system
	 * @param {*} itemId - id of the blog post to be deleted
	 */
	deletePost(itemId) {
		this.appManager.updateStatus(true, 'Deleting the post...');
		try {
			// seeks a confirmation
			dialog.showMessageBox(this.appManager.getMainWindow(), {
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
							this.appManager.updateStatus(false, 'Deleted');
							this.messageManager.send('deleted' + itemId, response);
						} else {

							// sends a failure status
							response = new ServerResponse().failure();
							this.messageManager.send('deleted' + itemId, response);
							this.appManager.updateStatus(false, 'Could not delete');
						}
					} catch (error) {
						console.error('Could not delete the blog post.', error);

						// sends a failure status
						response = new ServerResponse().failure();
						this.messageManager.send('deleted' + itemId, response);
						this.appManager.updateStatus(false, 'Could not delete');
					}
				} else {
					this.appManager.updateStatus(false, 'Cancelled deletetion');
				}
			});
		} catch (error) {
			console.error('Error in deleting the blog post.', error);
			// sends a failure status
			response = new ServerResponse().failure();
			this.appManager.updateStatus(false, 'Could not delete');
			this.messageManager.send('deleted' + itemId, response);
		}
	}

	/**
	 * Authorizes with Google API and invokes the publish method to publishes/drafts the post to Blogger.
	 * @param {*} blogURL 
	 * @param {*} postData 
	 * @param {*} fileName 
	 * @param {*} isDraft 
	 */
	publishPostToBlog(blogURL, post, file, isDraft) {

		this.appManager.updateStatus(true, 'Publishing the post...');

		var fileName = file;
		var postData = post;

		try {
			this.appManager.updateStatus(true, 'Saving post...');
			var saveData = this.savePost(fileName, postData);
			fileName = saveData.filename;
			postData = saveData.data;
		} catch (error) {
			console.error('Could not save post before publishing.', error);
		}

		try {
			//seekAuthorization
			this.appManager.updateStatus(true, 'Authenticating...');
			var authPromise = this.authManager.seekAuthorization([
				Permissions.BLOGGER_SCOPE, 
				Permissions.DRIVE_SCOPE
			]);
	
			authPromise.then(async () => {
				try {
					this.appManager.updateStatus(true, 'Fetching blog details...');
					var blogData = await this.bloggerAPI.getBlogByUrl(blogURL);
					this.publishPost(blogData.id, postData, fileName, isDraft);
				} catch (error) {
					console.error('Could not publish the post.', error);
					// sends a failure status
					response = new ServerResponse().failure();
					this.appManager.updateStatus(false, 'Could not publish');
					this.messageManager.send('published', response);

					dialog.showMessageBox(this.appManager.getMainWindow(), {
						type: 'error',
						title: 'Error',
						message: 'Error in publishing',
						detail: 'The blog post could not be published. Please try again.',
						buttons: ['Okay']
					});
				}
			}).catch(error => {
				console.error('Could not get authorization from the user.', error);
				// sends a failure status
				response = new ServerResponse().failure();
				this.appManager.updateStatus(false, 'Could not publish');
				this.messageManager.send('published', response);

				dialog.showMessageBox(this.appManager.getMainWindow(), {
					type: 'error',
					title: 'Error',
					message: 'Error in publishing',
					detail: 'The blog post could not be published. Please try again.',
					buttons: ['Okay']
				});
			})
		} catch (error) {
			console.error('Could not publish the blog post.', error);
			// sends a failure status
			response = new ServerResponse().failure();
			this.appManager.updateStatus(false, 'Could not publish');
			this.messageManager.send('published', response);

			dialog.showMessageBox(this.appManager.getMainWindow(), {
				type: 'error',
				title: 'Error',
				message: 'Error in publishing',
				detail: 'The blog post could not be published. Please try again.',
				buttons: ['Okay']
			});
		}
	}

	/**
	 * Publishes the blog post to Blogger. Uploads any RAW images in the post contents before publish.
	 * @param {*} blogId 
	 * @param {*} postData 
	 * @param {*} fileName 
	 * @param {*} isDraft 
	 */
	async publishPost(blogId, postData, fileName, isDraft) {
		this.appManager.updateStatus(true, 'Publishing the post...');
		var contents = postData.content;
		var response;
		var savedPost;

		try {

			this.appManager.updateStatus(true, 'Getting the images...');
			var updatedContents = await this.replaceLocalImages(contents);
			
			//process the contents for 'read more' dividers5
			postData.content = updatedContents.replace(new RegExp("<hr>|<hr></hr>|<hr/>"), '<!--more-->')

			this.appManager.updateStatus(true, 'Publishing the post to blogger...');
			this.bloggerAPI.publishPost(postData, blogId, isDraft, (result) => {

				postData.postId = result.id;
				postData.postURL = result.url;

				// replaces the post contents with the original contents (with local images)
				postData.content = contents;

				savedPost = this.savePost(fileName, postData);
				postData = savedPost.data;

				// populates the image base64 data wherever required.
				var fullContent = this.loadRAWImages(postData.content);

				response = new ServerResponse({
					data: postData,
					fullContent: fullContent
				}).ok();
				this.appManager.updateStatus(false, isDraft ? 'Drafted' : 'Published');
				this.messageManager.send('published', response);

				dialog.showMessageBox(this.appManager.getMainWindow(), {
					type: 'info',
					title: 'Done',
					message: 'Blog post published.',
					detail: 'The blog post has been published to your blog' + (isDraft ? ' as a draft' : '') + '.',
					buttons: ['Okay']
				});
			});
		} catch (error) {
			console.error('Could not publish the post.', error);
			throw error;
		}
	}

	/**
	 * Parses RAW image data from the post content and saves those to images directory
	 * @param {*} content 
	 */
	saveAndRemoveRAWImages(content) {
		try {	
			// convert the HTML content into DOM
			this.appManager.updateStatus(true, 'Saving images...');

			var dom = new DOMParser().parseFromString(content, "text/xml");
			var images = dom.getElementsByTagName('img');
			var imgData;
			var savedImg;
	
			if (images.length > 0 ) {
				for(var i = 0; i < images.length; i++) {
					imgData = images[i].getAttribute('src');
					savedImg = images[i].getAttribute('local-src');
					// if image is base64 data
					if (imgData != null && imgData.substring(0, 5) == 'data:') {
						if (savedImg == null || savedImg.trim() == '') {
							// uploads the image
							savedImg = this.mediaManager.saveImageToDisk(imgData);
	
							// updates the local-src with the image file name and removes base64 data
							this.__setLocalImage(images[i], savedImg.fileName, true);
						} else {
							images[i].removeAttribute('src');
						}
					}
				}
			}		
	
			return dom.toString();
		} catch (error) {
			console.error('Could not save the images.', error);
			throw error;
		}
	}

	/**
	 * Loads image src with base64 data of the local image
	 * @param {*} content 
	 */
	loadRAWImages(content) {
		try {	
			// convert the HTML content into DOM
			this.appManager.updateStatus(true, 'Fetching images...');

			var dom = new DOMParser().parseFromString(content, "text/xml");
			var images = dom.getElementsByTagName('img');
			var savedImg;
			var imgPath;
	
			if (images.length > 0 ) {
				for(var i = 0; i < images.length; i++) {
					imgPath = images[i].getAttribute('local-src');
					if (imgPath != null && imgPath.trim() != '' && imgPath.trim() != 'null') {
						imgPath = this.__getLocalImagePath(imgPath);

						// reads the image as base64 and set it to src attribute
						savedImg = this.fileSystemAdapter.readImageAsRAW(imgPath);
						this.__setImage(images[i], savedImg, false);
					}
				}
			}		
	
			return dom.toString();
		} catch (error) {
			console.error('Could not upload the images.', error);
			throw error;
		}
	}

	/**
	 * Replace images with local href with that of the remote, if mapping available.
	 * Uploads it if mapping is not available.
	 * @param {*} content 
	 */
	async replaceLocalImages(content) {
		try {	

			this.appManager.updateStatus(true, 'Refreshing images...');

			var dom = new DOMParser().parseFromString(content, "text/xml");
			var images = dom.getElementsByTagName('img');
	
			var imgFile;
	
			if (images.length > 0 ) {
				for(var i = 0; i < images.length; i++) {
					imgFile = images[i].getAttribute('local-src');
					if (imgFile != null && imgFile.trim() != '' && imgFile.trim() != 'null') {
						var mappedImage = this.mediaManager.getMappedRemoteImage(imgFile);
						
						// uploads the file if no mapping found
						if (mappedImage == null) {
							var link = this.__getLocalImagePath(imgFile);
							var albumId = await this.mediaManager.getMediaHost();

							this.appManager.updateStatus(true, 'Uploading images...');
							mappedImage = await this.mediaManager.uploadImageFromFile(imgFile, link, albumId);
						}
						
						this.__setImage(images[i], mappedImage, true);
					}
				}
			}
	
			return dom.toString();
		} catch (error) {
			console.error('Could not update the local images with remote images.', error);
			throw error;
		}
	}

	/**
	 * Sets a value to the src attribute of image dom element.
	 * Clears the local-src attribute if clean is specified.
	 * @param {*} imageDom 
	 * @param {*} image 
	 * @param {*} clean 
	 */
	__setImage(imageDom, image, clean) {
		imageDom.setAttribute('src', image);
		if (clean) {
			imageDom.removeAttribute('local-src');
		}
	}

	/**
	 * Sets the local-src attribute of an image DOM element with the value provided.
	 * Clears the src attribute value if clean is specified.
	 * @param {*} imageDom 
	 * @param {*} localImage 
	 * @param {*} clean 
	 */
	__setLocalImage(imageDom, localImage, clean) {
		imageDom.setAttribute('local-src', localImage);
		if (clean) {
			imageDom.removeAttribute('src');
		}
	}
}

module.exports.PostManagerService = PostManagerService;