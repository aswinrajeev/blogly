const { GoogleAPIAdapter } = require('../adapters/googleapi.adapter');
const { FileSystemConstants, Permissions, AuthListener } = require('../../configs/conf');
const http = require('http');
const url = require('url');

/**
 * Handler service for authentication related functionalities
 */
class AuthManagerService {

	/**
	 * Singleton constructor for auth manager service
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

		this.googleAPI = new GoogleAPIAdapter({
			debugMode: this.debugMode
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
	}

	/**
	 * Requests for authorization from the user and awaits tokens from Google.
	 * @param {*} scopes
	 */
	seekAuthorization(scopes) {

		// gets the authorization page URL
		var authUrl = this.googleAPI.generateAuthUrl(scopes);

		var window = this.appManager.createModalWindow({
			title: 'Authorize'
		});

		window.loadURL(authUrl);

		window.once('ready-to-show', () => {
			// opens the window
			window.show();
		});

		// returns the promise for authorization
		return this.__awaitAuthorization(window);
	}

	/**
	 * Listens for a callback from the google authorization service with the authorization code
	 */
	__awaitAuthorization(dialog) {
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
							const tokens = await this.googleAPI.generateToken(code);

							if (this.debugMode) {
								console.debug('Received tokens from Google server.');
							}

							// saves the tokens
							this.tokens = tokens;
							
							// updates the tokens in the authenticator
							this.googleAPI.setCredentials(tokens);

							if (this.debugMode) {
								console.debug('Applied tokens to the authenticator.');
							}
		
							// resolves the promise for authorization
							resolve(code);
						} else {
							reject('Could not fetch the code from Google.');
						}
					} catch (error) {
						console.error('Error in authorizing with Google.', error);
						reject(error);
					}	
				});
	
				// starts the listener in the 
				httpListener.listen(AuthListener.LISTENER_PORT);
				httpListener.setTimeout(500);
				if (this.debugMode) {
					console.debug('Listening for authorization confirmation from Google.');
				}

				// stops the server automatically if no response received within 2 mins
				setTimeout(() => {
					httpListener.close();
					dialog.close();
					console.error('Could not get any response from Google.');
					reject('Request timed out.');
				}, 120000);

			} catch (error) {
				console.error('Error in authorizing with Google.', error);
				reject(error);
			}
		});

		var serverPromise = new Promise((resolve, reject) => {
			codePromise.then(() => {
				try {
					// stops the listener
					httpListener.close();
					dialog.close();
				} catch (error) {
					console.error('Could not close the server.', error);
				}
				resolve();
			}).catch(error => {
				reject(error);
			});
		});

		return serverPromise;
	}
}

module.exports.AuthManagerService = AuthManagerService;