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

}

module.exports.BlogManagerService = BlogManagerService;