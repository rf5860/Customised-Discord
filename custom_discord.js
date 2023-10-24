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
  updatePreExistingMessages();
  addThemeSelectorOnLoad()
  registerForMutations();
}

const steamLinkRegex = /(steam:\/\/[^\s]+)/g;
const httpSteamLinkRegex = /(?<!steam:\/\/)(https:\/\/store\.steampowered\.com\/\S*)/g;
const markdownRegex = /(\|\s*)+\n\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\n/;

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
const isToolbarClass = e => isClassStartWith(e, 'toolbar');
const isNoThemeSelectorPresent = e => !isClassStartWith(e, 'theme-selectable');

const isChatClass = e => isClassStartWith(e, 'chat');
const nodeId = e => getAttribute(e, 'id');
const nodeClass = e => getAttribute(e, 'class');

function handleSteamLinkClick(event) {
  event.preventDefault();
  const url = event.target.getAttribute('data-steam-url');
  window.open(url);
}


// Incorporating marked options for GitHub-flavored Markdown
marked.setOptions({
  gfm: true
});

// Adding universal CSS for tables
let style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
}

th,
td {
  border: 1px solid #7A6C9A; /* Dark purple */
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #A7C7E7; /* Pastel blue */
}

th {
  background-color: #4C3A65; /* Dark */
  color: #E6E2F3; /* Light Purple */
}
`;

// Append the <style> element to the <head>
document.getElementsByTagName('head')[0].appendChild(style);

function addMarkdown(tables) {
  tables.forEach(tableNode => {
    var newInnerHtml = tableNode.innerHTML;
    const matches = [...tableNode.innerHTML.matchAll(/(<[^>]*?>\|[\s\S]*?\|<\/[^>]*?>)/g)];
    for (const match of matches) {
      const newNode = document.createElement('div');
      newNode.innerHTML = match[1];
      const newContent = marked.parse(newNode.innerText);
      const innerHtml = newNode.innerHTML;
      newInnerHtml = newInnerHtml.replace(match[1], newContent);
    }
    tableNode.innerHTML = newInnerHtml;
    tableNode.classList.add('md-tables');
  });
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

function addThemeSelectorOnLoad() {
  // addThemeSelector(document.querySelector('div[class^="toolbar"]:not(.theme-selectable)'));
}

function addThemeSelector(node) {
  if (isToolbarClass(node) && isNoThemeSelectorPresent(node)) {
    createThemeSelector(node);
    node.classList.add('theme-selectable');
    observeToolbar(document.querySelector('section[class^="title"]').parentElement);
  }
}

function updateContents(node) {
  if (isChatMessagesId(node) || isMainChatContentClass(node) || isChatClass(node) || isMessageContentId(node)) {
    const spans = [...node.querySelectorAll('div[id^="message-content"]>span:not(.steam-gear-icon)')];
    createSteamLinks(spans);
    const links = [...node.querySelectorAll('div[id^="message-content"]>a:not(.steam-gear-icon)')];
    addSteamLinks(links);

    const allContents = [...node.querySelectorAll('div[id^="message-content"]:not(.md-tables)')];
    const tables = allContents.filter(e => markdownRegex.test(e.innerText));
    console.log(">>>>> Tables");
    tables.forEach(e => console.log(e.innerHTML));
    addMarkdown(tables);
  }
}

function handleMutation(node) {
  updateContents(node);
  // addThemeSelector(node);
}

function updatePreExistingMessages() {
  const mainChatContent = document.querySelectorAll('main[class^="chatContent"]');
  mainChatContent.forEach(e =>{
    updateContents(e); // New function to add Steam links
  });
}

function observeToolbar(targetNode) {
  console.log(">>>>> Observing node", targetNode);
  const observer = new MutationObserver((mutationsList, _observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.removedNodes.length > 0) {
          if (mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach(node => {
              if (isToolbarClass(node) || (node.querySelector && node.querySelector('div[class^="toolbar"]'))) {
                console.log(">>>>> Toolbar removed", node);
              }
            });
          }
        }
        if (mutation.addedNodes.length > 0) {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (isToolbarClass(node) || (node.querySelector && node.querySelector('div[class^="toolbar"]:not(.theme-selectable)'))) {
                console.log(">>>>> Toolbar added", node);
                addThemeSelector(node.querySelector('div[class^="toolbar"]:not(.theme-selectable)'));
              }
            });
          }
        }
      }
    }
  });

  // Configuration for the observer:
  const config = { childList: true, subtree: true };

  // Start observing the target node
  observer.observe(targetNode, config);
}

function registerForMutations() {
  const observer = new MutationObserver((mutationsList, _observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Check for added nodes
        for (let node of mutation.addedNodes) {
          handleMutation(node);
        }
      }
    }
  });
  // TODO: Make this more specific? Nested selectors?
  const targetNode = document;
  const config = { childList: true, subtree: true };
  observer.observe(targetNode, config);
}

/**
 * @param {Node} node - The mutated DOM node
 */
function createThemeSelector(node) {
  const paintBrushIcon = `
<div class="theme-selector-button iconWrapper-2awDjA clickable-ZD7xvu" role="button" aria-label="Select Theme" tabindex="0">
  <svg viewBox="0 0 24 24" height="24" width="24" role="img" aria-hidden="true" class="icon-2xnN2Y" y="0" x="0">
    <g fill="none">
      <path fill="currentColor" d="M0,103.78c11.7-8.38,30.46.62,37.83-14a16.66,16.66,0,0,0,.62-13.37,10.9,10.9,0,0,0-3.17-4.35,11.88,11.88,0,0,0-2.11-1.35c-9.63-4.78-19.67,1.91-25,10-4.9,7.43-7,16.71-8.18,23.07ZM54.09,43.42a54.31,54.31,0,0,1,15,18.06l50.19-49.16c3.17-3,5-5.53,2.3-10.13A6.5,6.5,0,0,0,117.41,0,7.09,7.09,0,0,0,112.8,1.6L54.09,43.42Zm-16.85,22c2.82,1.52,6.69,5.25,7.61,9.32L65.83,64c-3.78-7.54-8.61-14-15.23-18.58-6.9,9.27-5.5,11.17-13.36,20Z" clip-rule="evenodd" fill-rule="evenodd" transform="scale(0.225)">
      </path>
    </g>
  </svg>
</div>
`;

  /** @type {HTMLElement} */
  const firstIcon = node.querySelector('div[class^="iconWrapper"]');
  // Create a temporary div to hold the paintBrushIcon markup
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = paintBrushIcon.trim();
  // Retrieve the created div containing the icon from the temporary div
  const themeSelectorDiv = tempDiv.firstChild;
  // Insert the icon div before the first icon
  firstIcon.parentElement.insertBefore(themeSelectorDiv, firstIcon);
  themeSelectorDiv.addEventListener('click', function (event) {
    var existingPopup = document.querySelector('.theme-selector-popup');
    if (existingPopup) {
      event.currentTarget.removeChild(existingPopup);
      return;
    }

    var popup = document.createElement('div');
    popup.id = 'popout_1866';
    popup.className = 'popup theme-selector-popup';
    popup.style.position = 'absolute';
    popup.style.zIndex = '1000';
    popup.style.maxHeight = '300px';
    popup.style.overflowY = 'scroll';
    popup.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-secondary-alt').trim();
    popup.style.color = getComputedStyle(document.documentElement).getPropertyValue('--interactive-normal').trim();
    popup.innerHTML = Object.keys(availableThemes).map(key => {
      return `<button data-theme-key="${key}" style="display: block; margin: 5px 0; background-color: var(--background-secondary); color: var(--interactive-normal); width: 300px; height: 40px; text-align: left;">${formatFilename(key)}</button>`;
    }).join('');

    // Attach event listeners to the buttons
    popup.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const themeKey = button.getAttribute('data-theme-key');
        selectTheme(themeKey);
      });
    });

    event.currentTarget.appendChild(popup);
  });
  function selectTheme(themeClass) {
    applyThemeByName(themeClass);
    var popup = document.querySelector('.theme-selector-popup');
    if (popup) {
      themeSelectorDiv.removeChild(popup);
    }
  }
}

const formatFilename = (filename) => {
  let formattedName = filename.replace(/\.css/g, '').replace(/_/g, ' ');
  formattedName = formattedName.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  return formattedName;
};
