// This is a test utility to try out a blog post insertion
// For executing the test, provide the required parameters in configurations. 

const {google} = require('googleapis');

/* configurations for the client authentication for google apis. exports client_id, secret and api_key */
const api_creds = require('../configs/googleapi'); // file not included as part of the source.

/* configurations for the tests. exports a testBlogId for the experimental blog. */
const test_config = require('../configs/tests'); // file not included as part of the source.

var oauth2Client = new google.auth.OAuth2(
	api_creds.client_id,
	api_creds.secret,
	'http://localhost:8080/'
);

oauth2Client.on('tokens', (tokens) => {
	if (tokens.refresh_token) {
	  // store the refresh_token in my database!
	//   console.log('Refresh token: ' + tokens.refresh_token);
	}
	// console.log('Grant token: ' + tokens.access_token);
  });

const scopes = [
	'https://www.googleapis.com/auth/blogger'
]

const respUrl = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: 'offline',
  
	// If you only need one scope you can pass it as a string
	scope: scopes
  });

console.log("Auth URL: " + respUrl);

var http = require('http');
var url = require('url');

var server = http.createServer(async function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end();
	var urlParams = url.parse(req.url, true).query;
	if (urlParams.code) {
		var code = urlParams.code;
		// console.log('code: ' + code);

		const {tokens} = await oauth2Client.getToken(code)

		// console.log('Tokens: ' + tokens)
		oauth2Client.setCredentials(tokens);

		insertBlog();
	}
	server.close();
  });
  
 server.listen(8080);

 var insertBlog = async function() {

	const blogger = google.blogger({
		version: 'v3',
		auth: oauth2Client,
	});

	const res = await blogger.posts.insert({
		blogId: test_config.testBlogId, 
		isDraft: false,
		resource: {
			title: 'My test blog',
			content: 'This is just a sample <b>blog post</b>. Let us see how it goes.'
		}
	});
	console.log(`The post has been plublished. The blog post url is ${res.data.url}.`);
 }