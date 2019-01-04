'use strict';
let Electron = require('electron');
let path = require('fire-path');
module.exports = {
  load () {
  },

  unload () {
  },

  messages: {
    'build_opendata' () {
       
	   let projectPath = Editor.projectInfo.path;
	   console.log(projectPath);
	   let url = path.join(projectPath,"packages/pak/build_opendata.bat");
       Electron.shell.openItem(url);
    },
	'build_all' () {
       
	   let projectPath = Editor.projectInfo.path;
	   console.log(projectPath);
	   let url = path.join(projectPath,"packages/pak/build_all.bat");
       Electron.shell.openItem(url);
    },
	'package' () {
       
	   let projectPath = Editor.projectInfo.path;
	   let url = path.join(projectPath,"packages/pak/package_all.bat");
       Electron.shell.openItem(url);
    },
	'upload' () {
       
	   let projectPath = Editor.projectInfo.path;
	   let url = path.join(projectPath,"packages/pak/upload.bat");
       Electron.shell.openItem(url);
    },
	'server_inside' () {
       
	   let projectPath = Editor.projectInfo.path;
	   let url = path.join(projectPath,"packages/pak/insidenet.bat");
       Electron.shell.openItem(url);
    },
	'server_outside' () {
       
	   let projectPath = Editor.projectInfo.path;
	   let url = path.join(projectPath,"packages/pak/outernet.bat");
       Electron.shell.openItem(url);
    }
  },
};