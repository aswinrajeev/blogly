const { BloggerAdapter } = require('./blogger_adapter.js');
const {GoogleDriveAdapter} = require('./google_drive_adapter.js');
const { listener_port, listener_host } = require('../configs/conf');
const { APIKeys } = require('../localconfigs/googleapi');
const { BrowserWindow } =  require('electron');
const { DOMParser } = require('xmldom');
const { dialog } = require('electron')

/**
 * Handler for all blog related functionalities. 
 * Single point of interface with UI for most of the UI backend communications.
 * @author Aswin Rajeev
 */
class BlogService {

	constructor(messenger, blogUrl, fileSystem, mainWindow) {
		this.messenger = messenger;
		this.blogUrl = blogUrl;
		this.fs = fileSystem;
		this.photos = null;
		this.blogger = null;
		this.mainWindow = mainWindow;
	}

	/**
	 * Initializes the blog adapter(s) and server-side listeners
	 */
	initialize() {

		// creates a new instance of Blogger Adapter.
		this.blogger = new BloggerAdapter({
			apiConf: new APIKeys(), 
			appConf: {
				listener_port: listener_port,
				listener_host: listener_host
			}, 
			debugMode: false
		});

		this.drive = new GoogleDriveAdapter({
			apiConf: new APIKeys(), 
			appConf: {
				listener_port: listener_port,
				listener_host: listener_host
			}, 
			debugMode: false
		});

		this.initializeService();
	}

	/**
	 * Initializes the server-side listeners
	 */
	initializeService() {

		// blog service related listeners
		this.messenger.respond('publishblog', async (data) => {
			return this.publishBlogPost(this.blogUrl, data.postData, data.fileName, false);
		});
		this.messenger.respond('publishdraft', async (data) => {
			return this.publishBlogPost(this.blogUrl, data.postData, data.fileName, true);
		});

		// file system service relared listeners
		this.messenger.respond('fetchposts', (data) => {
			return this.fs.fetchPostsList();
		});
		this.messenger.respond('fetchFullPost', (data) => {
			return this.fs.fetchPostData(data.filename);
		});
		this.messenger.respond('fetchBlogList', () => {
			return this.getBlogsList();
		});
		this.messenger.respond('savePost', (data) => {
			var savedData = this.fs.savePost(data.filename, data.postData);
			return savedData;
		})
		this.messenger.listen('deletePost', (data) => {
			var status = this.deleteBlogPost(data.itemId);
		})

	}

	/**
	 * Fetches the list of the blogs from the configs
	 */
	getBlogsList() {
		var blogs = this.fs.getConfigProperty('blogs') ;
		var blogList;
		if (blogs != null && blogs.length > 0) {
			blogList = blogs;
		} else {
			blogList =  [];
		}

		return {
			status: 200,
			blogs: blogList
		}
	}

	/**
	 * Deletes the post from the index data and from the file system
	 * @param {*} itemId - id of the blog post to be deleted
	 */
	deleteBlogPost(itemId) {
		try {
			dialog.showMessageBox ({
				type: 'info',
				buttons: ['Delete', 'Cancel'],
				message: 'Are you sure to delete the post?',
				title: 'Confirm'
			}, result => {
				if (result == 0) {
					var status = this.fs.deletePost(itemId);
					this.messenger.send('deleted' + itemId, {status:(status ? 200 : 0)});
				}
			})
		} catch (error) {
			console.error('Error in deleting the blog post.', error);
		}
	}

	/**
	 * Publishes a post after authorizing with the user.
	 * 
	 * @param {*} blogURL - url of the blog
	 * @param {*} postData - the data encompassing the blog post
	 * @param {*} fileName - the file name for the blog post
	 * @param {*} isDraft - flag to specify if the post is to be published as draft
	 */
	publishBlogPost(blogURL, postData, fileName, isDraft) {

		// save the blog post before publishing
		try {
			var savedData = this.fs.savePost(fileName, postData);
			fileName = savedData.fileName;
			postData = savedData.data;
		} catch (error) {
			console.error('Error in saving the blog post.', error);
		}
		
		try {
			this.seekAuthorization(blogURL, async (result) => {
				if (result != null && result.error == null) {
					return  this.publishPostData(result.id, postData, fileName, isDraft);
				} else {
					console.error('Unable to authorize.');
					return;
				}
			});
		} catch (error) {
			dialog.showMessageBox({
				type: 'error',
				title: 'Error',
				message: 'Error in uploading',
				detail: 'The blog post could not be uploaded due to a technical glitch.'
			});
		}
	}

	/**
	 * Open a new window and redirect to Google auth service
	 * 
	 * @param {*} blogUrl - URL of the blog
	 * @param {*} callback - callback function to be invoked after auth is completed
	 */
	seekAuthorization(blogUrl, callback) {
		var window = new BrowserWindow({
			height: 455,
			resizable: false,
			width: 370,
			title: 'Authorize',
			modal: true,
			parent: this.mainWindow,
			fullscreenable: false,
			show: false
		})
		
		// loads the authorization URL
		window.loadURL(this.blogger.generateAuthUrl());

		window.once('ready-to-show', () => {
			// opens the window
			window.show();
		})
		
		// listens for an acknowledgement
		const promise = this.blogger.awaitAuthorization({
			blogAPI: this.blogger.getBloggerAPI(),
			authClient: this.blogger.getAuth(),
		});

		promise.then(() => {

			// initializes the Photos API using the tokens
			var tokens = this.blogger.getTokens();

			//TODO: handle if token is null
			if (tokens) {
				this.drive.initialize({
					tokens: tokens
				});
	
				// get the details of the blog
				this.blogger.getBlogByUrl({
					blogAPI: this.blogger.getBloggerAPI(),
					authClient: this.blogger.getAuth(),
					url: blogUrl
				}).then((result) => {
					window.close();
					callback(result);
				})
			} else {
				window.close();
				callback(null);
			}

		})
	}

	/**
	 * Reads the google drive blogly directory id from config.
	 * If no config item present, create a directory and then stores the config.
	 */
	async getOrCreatePhotoAlbum() {
		var albumId = this.fs.getConfigProperty('blogly-dir');

		if (albumId == null) {
			albumId = await this.drive.createFolder('Blogly');
			this.fs.setConfigProperty('blogly-dir', albumId, true);
		}

		return albumId;
	}

	/**
	 * Publishes the blog post, post auth.
	 * Also adds any images in the post to Google Photos Blogly album
	 * 
	 * @param {*} blogId - id corresponding to the blog, as returned by the Google auth service
	 * @param {*} postData - the data encompassing the blog post
	 * @param {*} fileName - the file name for the blog post
	 * @param {*} isDraft - if to be saved as draft
	 */
	async publishPostData(blogId, postData, fileName, isDraft) {

		var title = postData.title;
		var contents = postData.content;
		var postId = postData.postId;

		try {
			// upload all images to Google Drive and replace the data with the image URL.
			var updatedContents = await this.uploadAllRawImages(contents);
	
			postData.content = updatedContents;
			var savedData = this.fs.savePost(fileName, postData);
			fileName = savedData.fileName;
			postData = savedData.data;
			
			this.blogger.publish({
				blogAPI: this.blogger.getBloggerAPI(),
				authClient: this.blogger.getAuth(),
				blogId: blogId,
				isDraft: isDraft,
				postId: postId,
				blogPost: {
					title: title,
					content: updatedContents
				}
			}).then((result) => {
	
				postData.postId = result.id;
				postData.postURL = result.url;
	
				// saves the post
				var savedData = this.fs.savePost(fileName, postData);
				postData = savedData.data;
	
				this.messenger.send('published', {
					status: 200,
					data: postData
				});
	
				dialog.showMessageBox({
					type: 'info',
					title: 'Done',
					message: 'Blog post published.',
					detail: 'The blog post has been successfully published to your blog' + (isDraft ? ' as a draft' : '') + '.'
				});
			})
		} catch (error) {
			console.error('Unable to publish the blog post.', error);
		}

	}

	/**
	 * Extracts each of the images in the blog post and uploads them to Google Drive. 
	 * Then the base64 data is replaced with the image URL.
	 * @param {*} content 
	 */
	async uploadAllRawImages(content) {

		// convert the HTML content into DOM
		var dom = new DOMParser().parseFromString(content, "text/xml");
		var images = dom.getElementsByTagName('img');
		var imgData;

		if (images.length > 0 ) {
			var albumId = await this.getOrCreatePhotoAlbum();
			for(var i = 0; i < images.length; i++) {
				if (images[i].attributes != null && images[i].attributes.getNamedItem('src') != null) {
					imgData = images[i].attributes.getNamedItem('src').nodeValue;
					// if image is base64 data
					if (imgData != null && imgData.substring(0, 5) == 'data:') {
						// uploads the image
						var link = await this.uploadImage(imgData, albumId);

						// updates the image src with the drive url
						images[i].attributes.getNamedItem('src').value = link;
					}
				}
			}
		}

		return dom.toString();
	}

	/**
	 * Uploads an image to Google Drive.
	 * 
	 * @param {*} imageData 
	 * @param {*} albumId 
	 */
	async uploadImage(imageData, albumId) {
		
		// extracts the image type
		var type = imageData.substring(11, imageData.indexOf(";base64"));

		// saves the file to disk for uploading
		var fileDetails = await this.fs.saveImage(imageData, type);
		var imageStream = this.fs.getFileReadStream(fileDetails.path);

		//uploads the image to Google drive and gets its URL
		var image = await this.drive.uploadImage(albumId, fileDetails.imageFileName, imageStream, type);

		return image.link;
	}
}

module.exports.BlogService = BlogService;
