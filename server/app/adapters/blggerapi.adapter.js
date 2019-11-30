const { GoogleAPIAdapter } = require('./googleapi.adapter');
const { Permissions } = require('../../configs/conf');

/**
 * Adapter for Google Blogger API
 * 
 * @author Aswin Rajeev
 */
class BloggerAPIAdapter {

	/**
	 * Singleton constructor for BloggerAPIAdapter
	 * 
	 * @param {*} args 
	 */
	constructor(args) {

		const defaultInstance = this.constructor.defaultInstance;
		if (defaultInstance) {

			if (defaultInstance.debugMode) {
				console.debug("Instance already exists. Ignoring the arguments.");
			}

			return defaultInstance;
		}
		
		this.debugMode = args.debugMode;
		
		this.googleAPI = new GoogleAPIAdapter({
			debugMode: this.debugMode
		});

		this.constructor.defaultInstance = this;
	}

	/**
	 * Returns the default instance of the class
	 */
	getDefaultInstance() {
		const defaultInstance = this.constructor.defaultInstance;
		if (defaultInstance == null) {
			throw new Error('Class not initialized yet.');
		}

		return defaultInstance;
	}

	/**
	 * Generate Blogger Auth URL
	 */
	generateAuthUrl() {
		return this.googleAPI.generateAuthUrl([
			Permissions.bloggerScope
		])
	}

	/**
	 * Fetches the blog data from the URL
	 * 
	 * @param {*} url 
	 */
	async getBlogByUrl(url) {
		try {
			var blog = await this.googleAPI.getBloggerAPI().blogs.getByUrl({
				url: url
			});
	
			if (this.debugMode) {
				console.debug('Received blog data from Google server.');
			}
	
			return blog.data;
		} catch (error) {
			console.error('Could not fetch the blog data.', error);
			throw error;
		}
	}

	/**
	 * Publishes a blog post to the blog specified by blogId
	 * 
	 * @param {*} post 
	 * @param {*} blogId 
	 * @param {*} isDraft 
	 * @param {*} callback 
	 */
	async publishPost(post, blogId, isDraft, callback) {
		try {	
			if (this.debugMode) {
				console.debug('Publishing the post to the blog.');
			}
	
			// compiles the blogdata
			var blogData = {
				blogId: blogId,
				isDraft: isDraft,
				resource: {
					title: post.title,
					content: post.content,
					labels: post.tags
				}
			};
	
			var result;
			if (postId != null && postId.trim() != '') {
				
				// TODO: Check if the post still exists, otherwise post as new
				// updates the post
				blogData.postId = postId;
				result = await this.googleAPI.getBloggerAPI().posts.update(blogData);
			} else {		
				// insert the post
				result = await args.blogAPI.posts.insert(blogData);
			}
	
			if (this.debugMode) {
				console.debug('The post has been published to Blogger' + (isDraft ? ' as a draft' : '') + '.');
			}
	
			if (callback) {
				if (this.debugMode) {
					console.debug('Invoking the callback after publish.');
				}
	
				// invokes the callback
				callback(result);
			}
		} catch (error) {
			console.error('Could not publish the blog post.', error);
			throw error;
		}
	}

}

module.exports.BloggerAPIAdapter = BloggerAPIAdapter;