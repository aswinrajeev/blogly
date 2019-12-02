const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { MessageManagerService } = require('./messagemanager.service');
const { Blog } = require('../models/blog');
const { ServerResponse } = require('../models/response');

/**
 * Manages the blog related operations
 * 
 * @author Aswin Rajeev
 */
class BlogManagerService {

	/**
	 * Singleton constructor for blog manager service
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
		this.messageManager.listen('newBlog', (blog) => {
			this.addNewBlog(blog);
		});

		this.messageManager.listen('deleteBlog', (blog) => {
			this.deleteBlog(blog);
		});
	}

	/**
	 * Gets the blog list from the application configs
	 */
	getBlogsList() {
		var blogs = this.fileSystemAdapter.getConfigProperty('blogs');

		var blogList = [];
		var blog;
		if (blogs != null && blogs.length > 0) {
			blogs.forEach(blogObj => {
				blog = new Blog(blogObj);
				blogList.push(blog.toJSON());
			});
		}

		return blogList;
	}

	/**
	 * Inserts the blog into the blogs list and return the blog
	 * @param {*} blogObj 
	 */
	addNewBlog(blogObj) {

		var blog = new Blog(blogObj);
		var response;

		try {
			var savedBlog;
			var blogs = this.getBlogsList();

			for (var i =0 ; i < blogs.length; i++) {
				savedBlog = new Blog(blogs[i]);
				if (savedBlog.url == blog.url) {

					// shows the error alert
					dialog.showMessageBox({
						type: 'error',
						title: 'Error',
						message: 'Blog is already connected',
						detail: 'The blog has already been connected. It cannot be added more than once.'
					});

					// sends error code
					response = new ServerResponse().failure();
					this.messenger.send('blogAdded', response);
				}
			}

			// adds the blog to the blog list and saves the list
			blogs.push(blog.toJSON());
			this.fileSystemAdapter.setConfigProperty('blogs', blogs, true);

			// sends the success signal
			response = new ServerResponse({
				blog: blog.toJSON()
			}).ok()
			this.messageManager.send('blogAdded', response);

		} catch (error) {
			console.error("Could not connect the blog", error);
			response = new ServerResponse().failure();
			this.messenger.send('blogAdded', response);
		}
	}

	/**
	 * deletes a blog from conencted blogs
	 *  */
	deleteBlog(blogObj) {
		var response;
		try {

			var blog = new Blog(blogObj);
			var savedBlog;

			var blogs = this.fileSystemAdapter.getConfigProperty('blogs');
			for (var i = 0 ; i < blogs.length; i++) {
				savedBlog = new Blog(blogs[i]);
				if (savedBlog.url == blog.url) {

					// removes the blog from the bloglist and saves it
					blogs.splice(i, 1);
					this.fileSystemAdapter.setConfigProperty('blogs', blogs, true);

					// sends the success message
					response = new ServerResponse().ok();
					this.messageManager.send('blogDeleted', response);
				}
			}

		} catch (error) {
			console.error('Could not delete the blog post.', error);

			// sends the error message
			response = new ServerResponse().failure();
			this.messageManager.send('blogDeleted', response);
		}
	}

}

module.exports.BlogManagerService = BlogManagerService;