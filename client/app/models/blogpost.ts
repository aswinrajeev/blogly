export class BlogPost {
	title: String = "";
	content: String = "";
	postId: String = null;
	postURL: String = null;
	itemId:number;

	file: String = null;

	constructor() {
		this.title = "";
		this.content = "";
		this.postId = null;
		this.file = "undefined";
		this.itemId = Math.floor(Date.now());
	}

}