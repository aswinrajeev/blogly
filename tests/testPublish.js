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

const promise = blogger.awaitAuthorization({
	blogAPI: blogger.getBloggerAPI(),
	authClient: blogger.getAuth(),
})

promise.then(() => {
	blogger.getBlogByUrl({
		blogAPI: blogger.getBloggerAPI(),
		authClient: blogger.getAuth(),
		url: 'https://asrtestblog.blogspot.com/'
	}).then((result) => {
		var blogId = result.id;
		console.log(`Blog Id is ${blogId}`);
		blogger.publish({
			blogAPI: blogger.getBloggerAPI(),
			authClient: blogger.getAuth(),
			blogId: blogId,
			isDraft: false,
			blogPost: {
				title: 'First perfect blog',
				content: 'Finally after a lot of trial and errors, I got to publish a blog post through my prototype application <b>Blogly</b>. Going foreward, I would be continuing with the development of the application. Let`s see'
			}
		}).then((result) => {
			console.log(`Blog published. The post URL is ${result.url}`)
		})
	})
})
