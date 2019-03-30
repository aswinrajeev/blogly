const { BloggerAdapter } = require('./blogger_adapter.js');
const { listener_port, listener_host } = require('../configs/conf');
const { APIKeys } = require('../localconfigs/googleapi');
const { app, BrowserWindow } =  require('electron');

/**
 * 
 * @author Aswin Rajeev
 */
class BlogService {

	constructor(messenger, blogUrl) {
		this.messenger = messenger;
		this.blogUrl = blogUrl;
	}

	// initialize the state and listeners
	initialize() {
		this.messenger.listen('publishblog', (data) => {
			this.publishBlog(this.blogUrl, data.title, data.content, false, data.postId);
		});

		this.messenger.listen('publishdraft', (data) => {
			this.publishBlog(this.blogUrl, data.title, data.content, true, data.postId);
		});

		this.blogger = new BloggerAdapter({
			apiConf: new APIKeys(), 
			appConf: {
				listener_port: listener_port,
				listener_host: listener_host
			}, 
			debugMode: false
		});
	}

	// publish a blog
	publishBlog(blogURL, title, contents, isDraft, postId) {
		this.seekAuthorization(blogURL, (result) => {
			this.uploadBlog(result.id, title, contents, isDraft, postId);
		});
	}

	// open a new window for authorization
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
		
		// load the authorization URL
		window.loadURL(this.blogger.generateAuthUrl());

		window.once('ready-to-show', () => {
			// open the window
			window.show();
		})
		
		// listen for an acknowledgement
		const promise = this.blogger.awaitAuthorization({
			blogAPI: this.blogger.getBloggerAPI(),
			authClient: this.blogger.getAuth(),
		});

		promise.then(() => {
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

	// publish the blog onto the blogger account
	uploadBlog(blogId, title, contents, isDraft, postId) {
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
