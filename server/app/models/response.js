
const OK = 200;
const SERVER_ERROR = 0;

/**
 * Response wrapper for blogly server responses
 */
class ServerResponse {

	constructor(data) {
		this.__data = data;
	}

	ok() {
		var resp = new Object();
		resp.status = OK;
		
		for (var key in this.__data) {
			if (this.__data.hasOwnProperty(key)) {
				resp[key] = this.__data[key];
			}
		}

		return resp;
	}

	failure(errorCode, error) {
		var resp = new Object();
		resp.status = errorCode ? errorCode : SERVER_ERROR;
		resp.error = error;

		return resp;
	}

}

module.exports.ServerResponse = ServerResponse;

module.exports.StatusCode = {};
module.exports.StatusCode.OK = 200;
module.exports.StatusCode.SERVER_ERROR = 0;