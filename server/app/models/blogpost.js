/**
 * Model class for Blog Post
 */
class BlogPost {

	constructor() {
		var currTime = Math.floor(Date.now());

		this._title = "Untitled";
		this._content = "";
		this._postId = null;
		this._postURL = null;
		this._file = null;
		this._itemId = 'p_' + currTime;
		this._isSaved = false;
		this._tags = [];
	}

	get title() {
		return this._title;
	}
	set title(title) {
		this.setTitle(title);
	}
	setTitle(title) {
		if (this._title !== title) {
			this.markDirty(true);
			this._title = title;
		}
	}

	get content() {
		return this._content;
	}
	set content(content) {
		this.setContent(content)
	}
	setContent(content) {
		if (this._content !== content) {
			this.markDirty(true);
			this._content = content;
		}
	}

	get postId() {
		return this._postId;
	}
	set postId(postId) {
		this.setPostId(postId);
	}
	setPostId(postId) {
		if (this._postId !== postId) {
			this.markDirty(true);
			this._postId = postId;
		}
	}

	get file() {
		return this._file;
	}
	set file(file) {
		this.setFile(file);
	}
	setFile(file) {
		if (this._file !== file) {
			this.markDirty(true);
			this._file = file;
		}
	}

	get itemId() {
		return this._itemId;
	}
	set itemId(itemId) {
		this.setItemId(itemId);
	}
	setItemId(itemId) {
		if (this._itemId !== itemId) {
			this.markDirty(true);
			this._itemId = itemId;
		}
	}

	get miniContent() {
		return this._miniContent;
	}
	set miniContent(miniContent) {
		this.setMiniContent(miniContent);
	}
	setMiniContent(miniContent) {
		if (this._miniContent !== miniContent) {
			this.markDirty(true);
			this._miniContent = miniContent;
		}
	}

	get postURL() {
		return this._postURL;
	}
	set postURL(postURL) {
		this.setPostURL(postURL);
	}
	setPostURL(postURL) {
		if (this._postURL !== postURL) {
			this.markDirty(true);
			this._postURL = postURL;
		}
	}

	get isSaved() {
		return this._isSaved;
	}
	set isSaved(isSaved) {
		this.setSaved(isSaved);
	}
	setSaved(isSaved) {
		if (this._isSaved !== isSaved) {
			this._isSaved = isSaved;
		}
	}

	get tags() {
		return this._tags;
	}
	set tags(tags) {
		this.setTags(tags);
	}
	setTags(tags) {
		if (this.tags !== tags) {
			this._tags = tags;
		}
	}

	/**
	 * gets the post as a JSON object 
	 * */
	getAsPost() {
		var post = {};
		post['title'] = this._title;
		post['content'] = this._content;
		post['itemId'] = this._itemId;
		post['postId'] = this._postId;
		post['postURL'] = this._postURL;
		post['tags'] = this._tags;

		return post;
	}
}

module.exports.BlogPost = BlogPost;