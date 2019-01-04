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
      let projectPath = Editor.Project.path;
      console.log(projectPath);
      let url = path.join(projectPath,"packages/pak/build_opendata.bat");
      Electron.shell.openItem(url);
    },
    'build_all' () {
      let projectPath = Editor.Project.path;
      console.log(projectPath);
      let url = path.join(projectPath,"packages/pak/build_all.bat");
      Electron.shell.openItem(url);
    },
	'package' () {
	   let projectPath = Editor.Project.path;
	   let url = path.join(projectPath,"packages/pak/package_all.bat");
       Electron.shell.openItem(url);
    }
  },
};