// ignoring because it should not be in dependencies
// eslint-disable-next-line
import {
	createProtocol,
	installVueDevtools,
} from "vue-cli-plugin-electron-builder/lib";
// ignoring because it should not be in dependencies
// eslint-disable-next-line
const { app, protocol, BrowserWindow, shell, nativeTheme, webContents, Menu } = require('electron')

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow() {
	// console.log("createWindow()");
	// Create the browser window.
	window = new BrowserWindow({
		width: 400,
		height: 600,
		titleBarStyle: "hiddenInset",
		autoHideMenuBar: true, // hide the menu bar by default on Windows
		minWidth: 330,
		show: false, // wait until readyToShow event is fired to show the window
		backgroundColor: nativeTheme.shouldUseDarkColors ? "#000" : "#FFF",
		webPreferences: {
			// in vue.config.js
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION 
		},
	});
	setOSTheme();
	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
		// uncomment the following line to open dev tools automatically on launch
		// if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol("app");
		// Load the index.html when not in development
		window.loadURL("app://./index.html");
	}
	// Prevents flash of white on dark mode
	window.once("ready-to-show", () => {
		window.show();
	});
	window.on("closed", () => {
		window = null;
	});
}

function setOSTheme() {
	let theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
	window.webContents.executeJavaScript(
		'localStorage.setItem("osTheme", "' + theme + '");'
	);
	window.webContents.executeJavaScript("window.__setTheme()");
}

nativeTheme.on("updated", () => {
	setOSTheme();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (window === null) {
		createWindow();
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installVueDevtools();
		} catch (e) {
			console.error("Vue Devtools failed to install:", e.toString());
		}
	}
	createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === "win32") {
		process.on("message", (data) => {
			if (data === "graceful-exit") {
				app.quit();
			}
		});
	} else {
		process.on("SIGTERM", () => {
			app.quit();
		});
	}
}

/*                         
  #    # ###### #    # #    # 
  ##  ## #      ##   # #    # 
  # ## # #####  # #  # #    # 
  #    # #      #  # # #    # 
  #    # #      #   ## #    # 
  #    # ###### #    #  ####  
*/

const template = [
  // { role: 'appMenu' }
  ...(process.platform === "darwin" ? [{
		// "Electron" in dev, should be replaced by package.json.productName by electron-builder
    label: app.name, 
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      process.platform === "darwin" ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(process.platform === "darwin" ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(process.platform === "darwin" ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
	},
  {
    role: 'help',
    submenu: [
      {
        label: 'Submit an issue',
        click: async () => {
          await shell.openExternal('https://github.com/macguirerintoul/Forecast/issues/new')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)