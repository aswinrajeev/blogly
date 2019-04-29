const { IpcMain, WebContents } = require('electron');

class MessagingService {
	constructor(ipcMain, webContents) {
		this.__ipc = ipcMain;
		this.__webContents = webContents;
		this.__listeners = null;
		this.__singleTimeListeners = null;
	}

	//Internal function for callbacks
	__callback(channel, payload, event) {
		if (this.__listeners != null && this.__listeners[channel] != null) {
			
			//Iterate through each of the listeners and invoke them
			this.__listeners[channel].forEach(listener => {
				listener.call(payload, channel, listener.args, event);
			});
		}

		if (this.__singleTimeListeners != null && this.__singleTimeListeners[channel] != null) {
			
			//Iterate through each of the listeners and invoke them
			this.__singleTimeListeners[channel].forEach(listener => {
				listener.call(payload, channel, listener.args, event);
			});

			//Delete the single-time listener channel
			delete this.__singleTimeListeners[channel];
		}
	}

	//Send a message to the webapp
	send(channel, payload) {
		if (this.__webContents) {
			this.__webContents.send(channel, payload);
		}
	}

	//Register a listener with the specified channel
	listen(channel, listener, args) {
		if (this.__listeners == null) {
			this.__listeners = new Object();
		}

		let self = this;

		//Create the channel if not exist
		if (this.__listeners[channel] == null) {
			this.__listeners[channel] = new Array();
			this.__ipc.on(channel, function(event, args) {
				self.__callback(channel, args, event);
			});
		}

		//Add the listener
		this.__listeners[channel].push({
			call: listener,
			args: args
		});
	}

	//Register a single time listener with the specified channel
	listenOnce(channel, listener, args) {
		if (this.__singleTimeListeners == null) {
			this.__singleTimeListeners = new Object();
		}

		let that = this;

		//Create the channel if not exist
		if (this.__singleTimeListeners[channel] == null) {
			this.__singleTimeListeners[channel] = new Array();
			this.__ipc.once(channel, function(event, args) {
				that.__callback(channel, args, event);
			});
		}

		//Add the listener
		this.__singleTimeListeners[channel].push({
			call: listener,
			args: args
		});
	}

	//Request for a response through a specified channel
	respond(channel, action) {
		//Create a listener for the channel
		let that = this;
		this.listen(channel, function(payload, channel, event) {
			let result = action(payload, event); //Call the response provider
			that.send(channel, result);
		}, null);
	}
}

module.exports.MessagingService = MessagingService;