import Quill from 'quill';
const ImageBlot = Quill.import('formats/image');

/**
 * Custom Blot to extend the image tag of Quill editor
 */
export class BloglyImageBlot extends ImageBlot {

  static blotName = 'bloglyImage';
  static tagName = 'img';

  /**
   * Converts the blot to HTML
   * @param value 
   */
  static create(value) {

    let node = super.create();
    
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
      url: node.getAttribute('src'),
      local_src: node.getAttribute('local-src')
    };
  }
}