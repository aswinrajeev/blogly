
/**
 * Handles the menu functions of the application
 * 
 * @author Aswin Rajeev
 * @copyright Aswin (c) 2018 - 2019
 */
class MenuManagerService {

	/**
	 * Constructor for the menu manager service.
	 * TODO: Make it singleton??
	 * @param {*} menu 
	 * @param {*} app 
	 */
	constructor(menu, app) {

		this.menu = menu;
		this.messenger = null;
		this.isMac = (process.platform === 'darwin');
		this.viewSidebar = true;

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
					label: 'Import blog post from file',
					accelerator: 'CmdOrCtrl+O',
				}, {
					label: 'Save blog post',
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
				}, {
					role: 'paste'
				}, 
				{
					role: 'selectall'
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
				/* this.importFromMenu, */ //TODO: Uncomment this once implemented
				this.draftToMenu,
				this.publishToMenu
			]
		};


		// toggle side bar menu
		this.togglePanelMenu = {
			label: 'Hide side panel',
			click: () => {
				this.viewSidebar = !this.viewSidebar;
				this.handleMenuClick('toggleSidePanel', {
					viewSideBar: this.viewSidebar
				});
				this.togglePanelMenu.label = (this.viewSidebar ? 'Hide' : 'Show') + ' side panel';
				this.renderMenu();
			}
		};

		this.viewMenu = {
			label: 'View',
			submenu: [
				{
					label: 'Toggle HTML editor',
					click: () => {
						this.handleMenuClick('htmlEditor');
					}
				}, this.togglePanelMenu, {
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
	 * Sets the compiled menu
	 */
	setMenu(menubar) {
		this.menubar = menubar;
		this.renderMenu();
	}

	/**
	 * Constructs the menu for the application
	 */
	renderMenu() {
		const menu = this.menu.buildFromTemplate([
			this.isMac && this.appMenu,
			this.fileMenu,
			this.editMenu,
			this.blogMenu,
			this.viewMenu,
			this.windowMenu,
			this.helpMenu
		]);

		this.menubar.setApplicationMenu(menu);
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

	/**
	 * Clears all blogs in the menus
	 */
	clearBlogs() {
		this.publishToMenu.submenu = [];
		this.draftToMenu.submenu = [];
		this.importFromMenu.submenu = [];
	}

	/**
	 * Add a new blog to publish, draft and import menus.
	 * 
	 * @param {*} blog 
	 */
	addBlog(blog) {
		var blogHandler = {
			label: blog.name,
			click: () => {
				this.handleMenuClick('publishToBlog', {
					blog: blog
				});
			}
		};
		this.publishToMenu.submenu.push(blogHandler);

		blogHandler = {
			label: blog.name,
			click: () => {
				this.handleMenuClick('draftToBlog', {
					blog: blog
				});
			}
		};
		this.draftToMenu.submenu.push(blogHandler);

		blogHandler = {
			label: blog.name,
			click: () => {
				this.handleMenuClick('importFromBlog', {
					blog: blog
				});
			}
		};
		this.importFromMenu.submenu.push(blogHandler);
	}
}

module.exports.MenuManagerService = MenuManagerService;
