
/**
 * Handles the menu functions of the application
 * 
 * @author Aswin Rajeev
 * @copyright Aswin (c) 2018 - 2019
 */
class MenuHandler {
	constructor(menu, app) {

		this.menu = menu;
		this.messenger = null;

		this.appMenu = {
			role: 'appMenu',
			label: app.getName(),
			submenu: [
				{ 
					role: 'about',
					label: 'About Blogly'
				}, { 
					type: 'separator' 
				}, { 
					label: 'Preferences',
					accelerator: 'CmdOrCtrl+,',
					click: () => {
						this.handleMenuClick('showSettings');
					}
				}, { 
					type: 'separator' 
				}, { 
					role: 'services' 
				}, { 
					type: 'separator' 
				}, { 
					role: 'hide' 
				}, { 
					role: 'hideothers' 
				}, {
					role: 'unhide' 
				}, { 
					type: 'separator' 
				}, { 
					role: 'quit' ,
					label: 'Quit Blogly'
				}
			]
		}

		this.fileMenu = {
			label: 'File',
			submenu: [
				{
					label: 'New Post',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						this.handleMenuClick('new');
					}
				}, {
					label: 'Import',
					accelerator: 'CmdOrCtrl+O',
				}, {
					label: 'Save',
					accelerator: 'CmdOrCtrl+S',
					click: () => {
						this.handleMenuClick('save');
					}
				}
			]
		};

		this.editMenu = {
			label: 'Edit',
			submenu: [
				{
					role: 'undo'
				}, {
					role: 'redo'
				}, {
					type: 'separator'
				}, {
					role: 'cut'
				}, {
					role: 'copy'
				}, {
					role: 'paste'
				}
			]
		};

		this.importFromMenu = {
			label: 'Import from blog',
			submenu: []
		};

		this.draftToMenu = {
			label: 'Draft to blog',
			submenu: []
		};

		this.publishToMenu = {
			label: 'Publish to blog',
			submenu: []
		};

		this.blogMenu = {
			label: 'Blog',
			submenu: [
				this.importFromMenu,
				this.draftToMenu,
				this.publishToMenu
			]
		};

		this.viewMenu = {
			label: 'View',
			submenu: [
				{
					label: 'Toggle HTML editor',
					click: () => {
						this.handleMenuClick('htmlEditor');
					}
				}, {
					label: 'Hide side panel',
					click: () => {
						this.handleMenuClick('toggleSidePanel');
					}
				}, {
					type: 'separator'
				}, {
					role: 'togglefullscreen'
				}, {
				   type: 'separator'
				}, {
					role: 'toggledevtools'
				 },
			]
		};

		this.windowMenu = {
			role: 'window',
			submenu: [
				{
					role: 'minimize'
				}, {
					role: 'close'
				}
			]
		};

		this.helpMenu = {
			role: 'help',
			submenu: [
				{
					label: 'Usage manual'
				}, {
					label: 'About the author'
				}
			]
		};
	}

	/**
	 * Sets the messenger to the menu handler
	 * 
	 * @param {*} messenger 
	 */
	setMessenger(messenger) {
		this.messenger = messenger;
	}

	/**
	 * Returns the compiled menu
	 */
	getMenu() {
		const menu = this.menu.buildFromTemplate([
			this.appMenu,
			this.fileMenu,
			this.editMenu,
			this.blogMenu,
			this.viewMenu,
			this.windowMenu,
			this.helpMenu
		]);

		return menu;
	}

	/**
	 * Invokes the menu handlers
	 * @param {*} action 
	 * @param {*} args 
	 */
	handleMenuClick(action, args) {
		try {
			this.messenger.send('menuInvoked', {
				action: action,
				args: args
			});
		} catch (error) {
			console.error("Could not invoke menu item.", error);
		}
	}
}

module.exports.MenuHandler = MenuHandler;
