const { google } = require('googleapis');
const Photos = require('googlephotos');
const http = require('http');
const url = require('url');

/**
 * Adapter for interfacing the application with Google Photos.
 * 
 * @author Aswin Rajeev
 */
class PhotosAdapter {

	/**
	 * Sets the configurations for the photos adapter.
	 * 
	 * @param {*} args - configurations
	 */
	constructor(args) {

		// backup the app configurations
		this.appConf = args.appConf;
		this.debugMode = args.debugMode;

		// set Photos API as null
		this.photos = null
	}

	/**
	 * Intializes the photos API with the token
	 * 
	 * @param {*} args - contains the configurations, along with the token
	 */
	initialize(args) {
		this.photos = new Photos(args.tokens);
	}

	/**
	 * Creates the Blogly Album in Google photos and returns the album id.
	 */
	async createBloglyAlbum() {
		var res = await this.photos.albums.create('Blogly Album');
		console.log(res);
		return res.id;
	}

}

module.exports.PhotosAdapter = PhotosAdapter;