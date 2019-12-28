import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

/**
 * Custom Blot to override the image tag of Quill editor
 */
export class BloglyImageBlot extends BlockEmbed {

  static blotName = 'bloglyImage';
  static tagName = 'img';

  /**
   * Converts the blot to HTML
   * @param value 
   */
  static create(value) {

    let node = super.create();
    
    node.setAttribute('alt', value.alt);
    node.setAttribute('src', value.url);
    node.setAttribute('local-src', value.local_src);
    return node;
  }

  /**
   * Converts HTML to blot
   * @param node 
   */
  static value(node) {

    return {
      alt: node.getAttribute('alt'),
      url: node.getAttribute('src'),
      local_src: node.getAttribute('local-src')
    };
  }
}