const { BloggerAdapter } = require('./blogger_adapter.js');
const { PhotosAdapter } = require('./google_photos_adapter.js');
const { listener_port, listener_host } = require('../configs/conf');
const { APIKeys } = require('../localconfigs/googleapi');
const { BrowserWindow } =  require('electron');

/**
 * Handler for all blog related functionalities. 
 * Single point of interface with UI for most of the UI backend communications.
 * @author Aswin Rajeev
 */
class BlogService {

	constructor(messenger, blogUrl, fileSystem) {
		this.messenger = messenger;
		this.blogUrl = blogUrl;
		this.fs = fileSystem;
		this.photos = null;
		this.blogger = null;
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

		this.photos = new PhotosAdapter({
			apiConf: new APIKeys(),
			debugMode: false
		})

		this.initializeService();
	}

	/**
	 * Initializes the server-side listeners
	 */
	initializeService() {

		// blog service related listeners
		this.messenger.listen('publishblog', (data) => {
			this.publishBlogPost(this.blogUrl, data._title, data._content, false, data._postId);
		});
		this.messenger.listen('publishdraft', (data) => {
			this.publishBlogPost(this.blogUrl, data._title, data._content, true, data._postId);
		});

		// file system service relared listeners
		this.messenger.respond('fetchposts', (data) => {
			return this.fs.fetchPostsList();
		});
		this.messenger.respond('fetchFullPost', (data) => {
			return this.fs.fetchPostData(data.filename);
		});
		this.messenger.respond('savePost', (data) => {
			return this.fs.savePost(data.filename, data.postData);
		})

	}

	/**
	 * Publishes a post after authorizing with the user.
	 * 
	 * @param {*} blogURL - url of the blog
	 * @param {*} title - title of the blog post
	 * @param {*} contents - blog post contents
	 * @param {*} isDraft - flag to specify if the post is to be published as draft
	 * @param {*} postId - post id, if available.
	 */
	publishBlogPost(blogURL, title, contents, isDraft, postId) {
		this.seekAuthorization(blogURL, (result) => {
			this.publishPostData(result.id, title, contents, isDraft, postId);
		});
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
			minimizable: false,
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
			this.photos.initialize({
				tokens:tokens.access_token
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
		})
	}

	/**
	 * Reads the google photos blogly album id from config.
	 * If no config item present, create an album and then stores the config.
	 */
	async getOrCreatePhotoAlbum() {
		var albumId = this.fs.getConfigProperty('blogly-album');

		if (albumId == null) {
			albumId = await this.photos.createBloglyAlbum();
			this.fs.setConfigProperty('blogly-album', albumId, true);
		}

		return albumId;
	}

	/**
	 * Publishes the blog post, post auth
	 * 
	 * @param {*} blogId - id corresponding to the blog, as returned by the Google auth service
	 * @param {*} title - title of the blog post
	 * @param {*} contents - contents of the blog post
	 * @param {*} isDraft - if to be saved as draft
	 * @param {*} postId - post id for an existing blog post
	 */
	async publishPostData(blogId, title, contents, isDraft, postId) {

		// TODO: do this only if images are present in the blog post.
		var albumId = await this.getOrCreatePhotoAlbum();

		console.log("Album ID is " + albumId);

		this.blogger.publish({
			blogAPI: this.blogger.getBloggerAPI(),
			authClient: this.blogger.getAuth(),
			blogId: blogId,
			isDraft: isDraft,
			postId: postId,
			blogPost: {
				title: title,
				content: contents
			}
		}).then((result) => {
			this.messenger.send('published', result);
		})
	}
}

module.exports.BlogService = BlogService;
