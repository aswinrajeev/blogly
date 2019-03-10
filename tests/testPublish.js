const { BloggerAdapter } = require('../server/app/blogger_adapter');
const { listener_port, listener_host } = require('../server/configs/conf');
const test_config = require('../server/localconfigs/tests'); // file not included as part of the source.
const { APIKeys } = require('../server/localconfigs/googleapi');

var blogger = new BloggerAdapter({
	apiConf: new APIKeys(), 
	appConf: {
		listener_port: listener_port,
		listener_host: listener_host
	}, 
	debugMode: false
});

console.log(blogger.generateAuthUrl());

blogger.awaitAuthorization({
	callback: blogger.getBlogByUrl,
	blogAPI: blogger.getBloggerAPI(),
	authClient: blogger.getAuth(),
	data: {
		url: 'https://asrtestblog.blogspot.com/',
		blogAPI: blogger.getBloggerAPI(),
		callback: function(res) {
			var blogId = res.data.id
			console.log('BlogId: ' + blogId);
			try {
				blogger.publish({
					blogAPI: blogger.getBloggerAPI(),
					blogId: blogId, 
					blogPost: {
						title: 'Test Blog 8', 
						content: 'Some contents are always there.', 
						tags: []
					}, 
					isDraft:false,
					callback: function() {
						console.log("Blog published.");
					}
				});
			} catch (error) {
				console.error(error);
			}
		}
	}
});

