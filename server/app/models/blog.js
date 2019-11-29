/**
 * Model class for Blog
 */
class Blog {

	constructor(name, url, blogId) {
		this._blogId = blogId;
		this._name = name;
		this._url = url;
	}

	get blogId() {
		return this._blogId;
	}
	set blogId(blogId) {
		this.setBlogId(blogId);
	}
	setBlogId(blogId) {
		this._blogId = blogId;
	}

	get name() {
		return this._name;
	}
	set name(name) {
		this.setName(name);
	}
	setName(name) {
		this._name = name;
	}

	get url() {
		return this._url;
	}
	set url(url) {
		this.setURL(url);
	}
	setURL(url) {
		this._url = url;
	}

	/**
	 * returns the blog as a JSON object 
	 * */
	getAsBlog() {
		var blog = {};
		blog['blogId'] = this.blogId;
		blog['name'] = this.name;
		blog['url'] = this.url;

		return blog;
	}
}

module.exports.Blog = Blog;