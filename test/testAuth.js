const {google} = require('googleapis');
const api_creds = require('../configs/googleapi');

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
	}
	server.close();
  });
  
 server.listen(8080);
