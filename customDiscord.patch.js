  // Start of Custom Discord Modifications
  const fs = require('fs');
  const path = require('path');
  const customDiscordPath = path.join(process.env.USERPROFILE, 'AppData/Local/DiscordPTB/custom_discord/');
  // Read the custom themes, and load them into an object for the renderer process to use.
  const customDiscordThemes = {};
  const customDiscordThemesPath = path.join(process.env.USERPROFILE, 'AppData/Local/DiscordPTB/custom_discord/themes/');
  fs.readdir(customDiscordThemesPath, (err, files) => {
    files.forEach(file => {
      const themeName = file;
      const customDiscordThemeFile = path.join(process.env.USERPROFILE, 'AppData/Local/DiscordPTB/custom_discord/themes/' + themeName);
      fs.readFile(customDiscordThemeFile, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        customDiscordThemes[themeName] = data;
      });
    });
  });
  // The customDiscordThemes object looks like this: { 'atom_one_dark.css': 'css file contents' }

  mainWindow.webContents.on('dom-ready', () => {
    setTimeout(() => {
      // Load the marked library to allow rendering of Markdown (for tables)
      const markedJs = fs.readFileSync(customDiscordPath + '/marked.js');
      mainWindow.webContents.executeJavaScript(markedJs.toString());
      // Load the custom_discord.js file, and call initCustomDiscord with the themes object.
      const customDiscordJs = fs.readFileSync(customDiscordPath + '/custom_discord.js');
      //  Call initCustomDiscord and supply it the loaded themes object.
      mainWindow.webContents.executeJavaScript(customDiscordJs.toString() + "initCustomDiscord(" + JSON.stringify(customDiscordThemes) + ");");
    }, 3000);
  });
  // End of Custom Discord Modifications