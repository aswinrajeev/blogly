export class Blog {
	private _blogId: String;
	private _name: String;
	private _url: String;	

	constructor(name: String, url: String, blogId:String) {
		this._blogId = blogId;
		this._name = name;
		this._url = url;
	}

	get blogId():String {
		return this._blogId;
	}
	set blogId(blogId: String) {
		this.setBlogId(blogId);
	}
	setBlogId(blogId: String) {
		this._blogId = blogId;
	}

	get name():String {
		return this._name;
	}
	set name(name: String) {
		this.setName(name);
	}
	setName(name: String) {
		this._name = name;
	}

	get url():String {
		return this._url;
	}
	set url(url:String) {
		this.setURL(url);
	}
	setURL(url:String) {
		this._url = url;
	}

	// returns the blog as a JSON object
	getAsBlog() {
		var blog = {};
		blog['blogId'] = this.blogId;
		blog['name'] = this.name;
		blog['url'] = this.url;

		return blog;
	}
}