import { Injectable } from '@angular/core';
import { IpcRenderer, ipcRenderer } from 'electron';

@Injectable({
	providedIn: 'root',
})
export class MessagingService {
	//Define the inter process communication object for messaging
	private _ipc: IpcRenderer | undefined;
	private _listeners;
	private _singleTimeListeners;

	constructor() {
		try {
			this._ipc = window.require('electron').ipcRenderer; //Initialize the IPC object.
		} catch (e) {
			console.error('Could not initialize Electron IPC.');
			throw e;
		}
	}

	//Sends a message to the main application through the specified channel
	send(channel: string, payload: object) {
		if (this._ipc) {
			this._ipc.send(channel, payload);
		}
	}

	//Internal function for callbacks
	__callback(channel: string, payload, event) {
		if (this._listeners != null && this._listeners[channel] != null) {
			//Iterate through each of the listeners and invoke them
			this._listeners[channel].forEach((listener) => {
				listener.call(payload, channel, listener.args, event);
			});
		}

		if (
			this._singleTimeListeners != null &&
			this._singleTimeListeners[channel] != null
		) {
			//Iterate through each of the listeners and invoke them
			this._singleTimeListeners[channel].forEach((listener) => {
				listener.call(payload, channel, listener.args, event);
			});

			//Delete the single-time listener channel
			delete this._singleTimeListeners[channel];
		}
	}

	//Register a listener with the specified channel
	listen(channel: string, listener, args) {
		if (this._listeners == null) {
			this._listeners = new Object();
		}

		let that = this;

		//Create the channel if not exist
		if (this._listeners[channel] == null) {
			this._listeners[channel] = new Array();
			this._ipc.on(channel, function (event, args) {
				that.__callback(channel, args, event);
			});
		}

		//Add the listener
		this._listeners[channel].push({
			call: listener,
			args: args,
		});
	}

	//Register a single time listener with the specified channel
	listenOnce(channel: string, listener, args) {
		if (this._singleTimeListeners == null) {
			this._singleTimeListeners = new Object();
		}

		let that = this;

		//Create the channel if not exist
		if (this._singleTimeListeners[channel] == null) {
			this._singleTimeListeners[channel] = new Array();
			this._ipc.once(channel, function (event, args) {
				that.__callback(channel, args, event);
			});
		}

		//Add the listener
		this._singleTimeListeners[channel].push({
			call: listener,
			args: args,
		});
	}

	// invokes a listener/listenOnce method
	invoke(channel: string, args, event) {
		this.__callback(channel, args, event);
	}

	//Request for a response through a specified channel
	request(channel: string, payload, action) {
		//Create a listener for the channel
		this.listenOnce(
			channel,
			function (payloadOut, channel: string, event) {
				action(payloadOut);
			},
			payload
		);

		//Send the channel request to the application
		this.send(channel, payload);
	}
}
