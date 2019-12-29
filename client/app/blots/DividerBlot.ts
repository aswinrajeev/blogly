import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

/**
 * Custom Blot to support Hr element.
 * This would be used to be substituted with 'read more' for blogger
 */
export class DividerBlot extends BlockEmbed {
	static blotName = 'divider';
	static tagName = 'hr';
}