const { FileSystemAdapter } = require('../adapters/filesystem.adapter');
const { MessageManagerService } = require('./messagemanager.service');
const { Blog } = require('../models/blog');

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
					this.messenger.send('blogAdded', {
						status: 1
					});
					return;
				}
			}

			// adds the blog to the blog list and saves the list
			blogs.push(blog.toJSON());
			this.fileSystemAdapter.setConfigProperty('blogs', blogs, true);

			// sends the success signal
			this.messageManager.send('blogAdded', {
				status: 200,
				blog: blog.toJSON()
			});

		} catch (error) {
			console.error("Could not connect the blog", error);
			this.messenger.send('blogAdded', {
				status: 0
			});
		}
	}

	/**
	 * deletes a blog from conencted blogs
	 *  */
	deleteBlog(blogObj) {
		try {

			var blog = new Blog(blogObj);
			var savedBlog;

			var blogs = this.fs.getConfigProperty('blogs');
			for (var i = 0 ; i < blogs.length; i++) {
				savedBlog = new Blog(blogs[i]);
				if (savedBlog.url == blog.url) {

					// removes the blog from the bloglist and saves it
					blogs.splice(i, 1);
					this.fileSystemAdapter.setConfigProperty('blogs', blogs, true);

					// sends the success message
					this.messenger.send('blogDeleted', {
						status: 200
					});

					return;
				}
			}

		} catch (error) {
			// sends the error message
			this.messenger.send('blogDeleted', {
				status: 0
			});
		}
	}

}

module.exports.BlogManagerService = BlogManagerService;