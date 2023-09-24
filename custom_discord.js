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
  watchForSteamLinks();
}

const steamLinkRegex = /(steam:\/\/[^\s]+)/g;
const httpSteamLinkRegex = /(?<!steam:\/\/)(https:\/\/store\.steampowered\.com\/\S*)/g;

const hasAttribute = (e, attr) => e && e.hasAttribute && e.hasAttribute(attr);
const getAttribute = (e, attr) => hasAttribute(e, attr) && e.getAttribute(attr) || `no ${attr}`;
const getParent = e => e && e.parentElement;

const isAttrStartsWith = (e, attr, val) => getAttribute(e, attr).startsWith(val);
const isClassStartWith = (e, val) => isAttrStartsWith(e, 'class', val);
const isIdStartWith = (e, val) => isAttrStartsWith(e, 'id', val);

const isChatMessagesId = e => isIdStartWith(e, 'chat-messages');
const isMainChatContentClass = e => isClassStartWith(e, 'chatContent');
const isMessageContentClass = e => isClassStartWith(e, 'message-content');
const isMessageContentId = e => isIdStartWith(e, 'message-content');

const isChatClass = e => isClassStartWith(e, 'chat');
const nodeId = e => getAttribute(e, 'id');
const nodeClass = e => getAttribute(e, 'class');

function handleSteamLinkClick(event) {
  event.preventDefault();
  const url = event.target.getAttribute('data-steam-url');
  window.open(url);
}

function addSteamLinks(links) {
  links.forEach(e => {
    e.insertAdjacentHTML('afterend', ` <a href="#" data-steam-url="steam://openurl/${e.href}">⚙️</a>`);
    e.classList.add('steam-gear-icon');
    e.parentElement.querySelectorAll('a[data-steam-url]').forEach(link => {
      link.addEventListener('click', handleSteamLinkClick);
    });
  });
}

function createSteamLinks(filteredMessages) {
  filteredMessages.forEach(e => {
    e.innerHTML = e.innerHTML.replaceAll(steamLinkRegex, (_match, p1) => `<a href="#" data-steam-url="${p1}">${p1}</a>`);
    e.classList.add('steam-gear-icon');
  });
  filteredMessages.forEach(e => {
    e.querySelectorAll('a[data-steam-url]').forEach(link => {
      link.addEventListener('click', handleSteamLinkClick);
    });
  });
}

function updateSteamLink(node) {
  if (isChatMessagesId(node) || isMainChatContentClass(node) || isChatClass(node) || isMessageContentId(node)) {
    const spans = [...node.querySelectorAll('div[id^="message-content"]>span:not(.steam-gear-icon)')];
    createSteamLinks(spans);
    const links = [...node.querySelectorAll('div[id^="message-content"]>a:not(.steam-gear-icon)')];
    addSteamLinks(links);
  }
}

function watchForSteamLinks() {
  const mainChatContent = document.querySelectorAll('main[class^="chatContent"]');
  mainChatContent.forEach(e => updateSteamLink(e));

  const observer = new MutationObserver((mutationsList, _observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (let node of mutation.addedNodes) {
          updateSteamLink(node);
        }
      }
    }
  });
  // TODO: Make this more specific? Nested selectors?
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  observer.observe(targetNode, config);
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