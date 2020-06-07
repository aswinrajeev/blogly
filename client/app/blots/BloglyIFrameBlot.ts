import Quill from 'quill';
const FrameBlot = Quill.import('blots/block/embed');

/**
 * Custom Blot to extend the image tag of Quill editor
 */
export class BloglyIFrameBlot extends FrameBlot {
	static blotName = 'bloglyFrame';
	static tagName = 'iframe';

	/**
	 * Converts the blot to HTML
	 * @param value
	 */
	static create(value) {
		let node = super.create();

		node.setAttribute('src', value.url);
		node.setAttribute('frameborder', value.frameborder);
		node.setAttribute('allow', value.allow);
		node.setAttribute('width', value.width);
		node.setAttribute('height', value.height);
		node.setAttribute('style', value.style);
		node.setAttribute('scrolling', value.scrolling);
		node.setAttribute('allowTransparency', value.allowTransparency);
		return node;
	}

	/**
	 * Converts HTML to blot
	 * @param node
	 */
	static value(node) {
		return {
			url: node.getAttribute('src'),
			frameborder: node.getAttribute('frameborder'),
			allow: node.getAttribute('allow'),
			width: node.getAttribute('width'),
			height: node.getAttribute('height'),
			style: node.getAttribute('style'),
			scrolling: node.getAttribute('scrolling'),
			allowTransparency: node.getAttribute('allowTransparency'),
		};
	}
}
