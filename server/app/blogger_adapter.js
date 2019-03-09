const { google } = require('googleapis');
const { APIKeys } = require('../configs/googleapi');
const http = require('http');
const url = require('url');

class BloggerAdapter {

	constructor() {

		var apikeys = new APIKeys();

		this.authClient = new google.auth.OAuth2(
			apikeys.client_id,
			apikeys.client_secret,
			'http://localhost:8080'
		);

		this.authClient.on('tokens', (tokens) => {
			if (tokens.refresh_token) {
			  console.log('Found a refresh token.');
			}
			console.log('Updated the tokens.');
		});

		this.authClient.on('tokens', (tokens) => {
			if (tokens.refresh_token) {
				console.log('Found a refresh token.');
			}
			console.log('Updated the tokens.');
		});

		this.blogAPI = google.blogger({
			version: 'v3',
			auth: this.authClient
		});
	}

	generateAuthUrl() {
		return this.authClient.generateAuthUrl({
			access_type: 'offline',
			scope: [
				'https://www.googleapis.com/auth/blogger'
			]
		});
	}

	getAuth() {
		return this.authClient;
	}

	getConnection() {
		return this.blogAPI;
	}

	async getBlogByUrl(blogAPI, data) {
		const res = await blogAPI.blogs.getByUrl({
			url: data.url
		});
		if (data.callback) {
			data.callback(res);
		}
		return res.data;
	}


	async authorizeAction(data, callback) {
		var self = this;

		var codePromise = new Promise((resolve, reject) => {
			self.httpListener = http.createServer(async (req, res) => {
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end();

				var urlParams = url.parse(req.url, true).query;
				if (urlParams.code) {
					var code = urlParams.code;
					const {tokens} = await self.authClient.getToken(code);
					self.authClient.setCredentials(tokens);

					resolve(code);
				}

			});
			self.httpListener.listen(8080);
			console.log('Waiting for authorization...');
		});

		await codePromise.then(function(code) {
			if (data && callback) {
				callback(self.blogAPI, data);
			}
			self.httpListener.close();
		});
	}

	async publish(blogAPI, data) {

		const status = await blogAPI.posts.insert({
			blogId: data.blogId,
			isDraft: data.isDraft,
			resource: {
				title: data.blogPost.title,
				content: data.blogPost.content
			}
		});

		console.log('Published the blog post.');
		if (data.callback) {
			data.callback(status);
		}
		return status.data;

	}


}

module.exports.BloggerAdapter = BloggerAdapter;