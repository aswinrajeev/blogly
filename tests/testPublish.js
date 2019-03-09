const { BloggerAdapter } = require('../server/app/blogger_adapter');
const test_config = require('../server/configs/tests'); // file not included as part of the source.

var blogger = new BloggerAdapter();

console.log(blogger.generateAuthUrl());

blogger.authorizeAction({
	url: 'https://www.aswinsblog.com',
	callback: function(res) {
		console.log(res.data.id);

		blogger.publish(blogger.getConnection(), {
			blogId: test_config.testBlogId, 
			blogPost: {
				title: 'Test Blog 8', 
				content: 'Some contents are always there.', 
				tags: []
			}, 
			isDraft:false
		});
	}
}, blogger.getBlogByUrl);

