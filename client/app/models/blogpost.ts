export class BlogPost {
	private _title: String;
	private _content: String;
	private _miniContent: String;
	private _file: String;
	private _postId: String; //for blog id at blogger
	private _postURL: String;
	private _itemId:number; // for internal id
	private _isSaved:boolean;

	constructor() {
		this._title = "Untitled";
		this._content = "";
		this._postId = null;
		this._postURL = null;
		this._file = null;
		this._itemId = null;
		this._isSaved = false;
	}

	get title() {
		return this._title;
	}
	set title(title: String) {
		this.setTitle(title);
	}
	setTitle(title:String) {
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

	// gets the post as a JSON object
	getAsPost() {
		var post = {};
		post['title'] = this._title;
		post['content'] = this._content;
		post['itemId'] = this._itemId;
		post['postId'] = this._postId;
		post['postURL'] = this._postURL;

		return post;
	}

	updateMiniContent() {
		this._miniContent = this._content != null ? this._content.replace(/<[^>]*>/g, "").slice(0, 100) : "";
	}

	markDirty(isDirty: boolean) {
		this._isSaved = !isDirty;
	}
}