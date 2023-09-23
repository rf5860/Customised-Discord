var availableThemes;

function listAvailableThemes() {
  console.log("Available themes:");
  Object.keys(availableThemes).forEach((theme) => {
    console.log(theme.replace(".css", ""));
  });
}

function applyThemeByName(themeName) {
  if (availableThemes[themeName]) {
    applyTheme(availableThemes[themeName]);
  } else {
    console.error("Theme not found: " + themeName);
  }
}

function applyTheme(cssString) {
  // Remove our old stylesheet if it exists
  let oldStyleSheet = document.getElementById("custom_discord_theme");
  if (oldStyleSheet) {
    oldStyleSheet.remove();
  }

  // Create a new stylesheet with the theme
  let styleSheet = document.createElement("style");
  styleSheet.id = "custom_discord_theme";
  styleSheet.innerText = cssString;
  document.head.appendChild(styleSheet);
}
function initCustomDiscord(themes) {
  availableThemes = themes;
  let theme = 'purple_own.css';
  applyTheme(themes[theme]);
}

function addStyleButtonNearUserSettings() {
  // create the button element
  const button = document.createElement('button');
  button.innerHTML = '🖌';
  document.body.appendChild(button);

  // create the dropdown element
  const dropdown = document.createElement('select');
  document.body.appendChild(dropdown);

  // create the close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = 'X';
  document.body.appendChild(closeButton);

  // hide the dropdown and close button initially
  dropdown.style.display = 'none';
  closeButton.style.display = 'none';

  // populate the dropdown with the availableThemes object keys
  Object.keys(availableThemes).forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.text = key;
    dropdown.add(option);
  });

  // add event listener to the paintbrush button
  button.addEventListener('click', () => {
    dropdown.style.display = 'block';
    closeButton.style.display = 'block';
  });

  // add event listener to the dropdown
  dropdown.addEventListener('change', () => {
    const selectedThemeKey = dropdown.value;
    applyTheme(availableThemes[selectedThemeKey]);
  });

  // add event listener to the close button
  closeButton.addEventListener('click', () => {
    dropdown.style.display = 'none';
    closeButton.style.display = 'none';
  });

  // function to apply the selected theme
  function applyTheme(themeKey) {
    // your code to apply the theme here
    console.log('Applying theme:', themeKey);
  }

}