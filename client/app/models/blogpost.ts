export class BlogPost {
	title: String = "";
	content: String = "";
	miniContent: String = "";
	postId: String = null; //for blog id at blogger
	postURL: String = null;
	itemId:number; // for internal id
	isSaved:boolean;

	file: String = null;

	constructor() {
		this.title = "";
		this.content = "";
		this.postId = null;
		this.file = "undefined";
		this.itemId = Math.floor(Date.now());
		this.isSaved = false;
	}

	updateMiniContent() {
		this.miniContent = this.content != null ? this.content.slice(0, 100) : "";
	}

	markDirty(isDirty: boolean) {
		this.isSaved = !isDirty;
	}
}