const { google } = require('googleapis');
const http = require('http');
const url = require('url');

/**
 * Adapter for interfacing the application with Blogger.
 * 
 * @author Aswin Rajeev
 */
class BloggerAdapter {

	// accepts the api configurations and application configurations passed from the application
	constructor(args) {

		// backup the app configurations
		this.appConf = args.appConf;
		this.debugMode = args.debugMode;

		// create a google API authenticator
		this.authClient = new google.auth.OAuth2(
			args.apiConf.client_id,
			args.apiConf.client_secret,
			`http://${this.appConf.listener_host}:${this.appConf.listener_port}`
		);

		this.tokens = null;

		// event handler for the token update
		this.authClient.on('tokens', (tokens) => {
			if (tokens.refresh_token) {

			}
		});

		// define the google blogger API controller with the API authenticator
		this.blogAPI = google.blogger({
			version: 'v3',
			auth: this.authClient
		});

		if (this.debugMode) {
			console.debug('Blogger API initialized.');
		}
	}
	
	/**
	 * Returns the API auth client
	 */
	getAuth() {
		return this.authClient;
	}

	/**
	 * Returns the blogger API
	 */
	getBloggerAPI() {
		return this.blogAPI;
	}

	/**
	 * Returns the tokens
	 */
	getTokens() {
		return this.tokens;
	}

	/**
	 * Generates an authorization URL for the user
	 */	
	generateAuthUrl() {
		return this.authClient.generateAuthUrl({
			access_type: 'offline',
			scope: [
				'https://www.googleapis.com/auth/blogger',
				'https://www.googleapis.com/auth/drive.file'
			]
		});
	}

	/**
	 * Listens for a callback from the google authorization service with the authorization code
	 * @param {*} args - parameters passed into the callback
	 */
	awaitAuthorization(args) {
		var httpListener;

		// create a promise that would be resolved when the code is obtained
		var codePromise = new Promise((resolve, reject) => {

			try {		
				// define a server to listen for any incoming requests
				httpListener = http.createServer(async (req, res) => {
					try {

						if (this.debugMode) {
							console.debug('Received response on listener.');
						}

						// provides a success message
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write('Redirecting to Blogo...');
						res.end();
		
						var urlParams = url.parse(req.url, true).query;

						// if the request contains a code
						if (urlParams.code) {
							
							var code = urlParams.code;

							if (this.debugMode) {
								console.debug('Received a code from Google server.');
							}

							// awaits the tokens using the code
							const { tokens } = await this.authClient.getToken(code);

							if (this.debugMode) {
								console.debug('Received tokens from Google server.');
							}

							// saves the tokens
							this.tokens = tokens;
							
							// updates the tokens in the authenticator
							this.authClient.setCredentials(tokens);

							if (this.debugMode) {
								console.debug('Applied tokens to the authenticator.');
							}
		
							// resolves the promise for authorization
							resolve(code);
						}
					} catch (error) {
						console.error(error);
						reject(error);
					}	
				});
	
				// starts the listener in the 
				httpListener.listen(this.appConf.listener_port);
				httpListener.setTimeout(500);
				if (this.debugMode) {
					console.debug('Listening for authorization confirmation from Google.');
				}

				// stops the server automatically if no response received within 2 mins
				setTimeout(() => {
					httpListener.close()
				}, 120000);

			} catch (error) {
				reject(error);
			}
		});

		// resolution action for the authorization promise
		codePromise.then((code) => {
			
			// stops the listener
			httpListener.close();
			if (this.debugMode) {
				console.debug('Closing the listener.');
			}
			
			// calls the callback if specified
			if (args.callback) {

				// passes args into the callback if provided
				if (args.data) {
					if (this.debugMode) {
						console.debug('Invoking the callback after authorization.');
					}
					args.data.err = null;
					args.callback(args.data);
				} else {
					if (this.debugMode) {
						console.debug('Invoking the callback after authorization.');
					}
					args.callback({
						err: null
					});
				}
			}


		}, (err) => {
			if (args.callback) {
				if (this.debugMode) {
					console.debug('Invoking the callback after authorization failed.');
				}
				args.callback({
					err: err
				});
			}
		});

		return codePromise;
	}

	/**
	 * Returns the blog args from a specified URL
	 * @param {*} args - parameters passed on to the callback
	 */
	async getBlogByUrl(args) {

		const result = await args.blogAPI.blogs.getByUrl({
			url: args.url
		});

		if (this.debugMode) {
			console.debug('Received blog data from Google server.');
		}

		// calls the callback if provided
		if (args.callback) {
			if (this.debugMode) {
				console.debug('Invoking the callback on getting blog data.');
			}
			args.callback(result);
		}

		return result.data;
	}

	/**
	 * Publishes a blog
	 * @param {*} args - blog data
	 */
	async publish(args) {

		if (this.debugMode) {
			console.debug('Publishing the post to the blog.');
		}

		// compile the blogdata
		var blogData = {
			blogId: args.blogId,
			isDraft: args.isDraft,
			resource: {
				title: args.blogPost.title,
				content: args.blogPost.content
			}
		};

		var result;
		if (args.postId != null && args.postId.trim() != '') {
			
			// updates the post
			blogData.postId = args.postId;
			result = await args.blogAPI.posts.update(blogData);
		} else {		
			// insert the post
			result = await args.blogAPI.posts.insert(blogData);
		}

		if (this.debugMode) {
			console.debug('Blog publishing completed.');
		}

		// calls the callback if provided
		if (args.callback) {
			if (this.debugMode) {
				console.debug('Invoking the callback after publish.');
			}
			args.callback(result);
		}

		return result.data;

	}

}

module.exports.BloggerAdapter = BloggerAdapter;