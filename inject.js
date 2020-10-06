const script = document.createElement("script");
script.src = chrome.runtime.getURL("bot.js");
(document.head || document.documentElement).appendChild(script);
