// ==UserScript==
// @name         force-copy
// @namespace    https://github.com/tizee-tampermonkey-scripts/tampermonkey-force-copy
// @downloadURL  https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-force-copy/refs/heads/main/force-copy.js
// @updateURL    https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-force-copy/refs/heads/main/force-copy.js
// @version      1.2
// @description  force web to enable copy, context menu
// @author       tizee
// @icon         https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f4dd.png
// @grant        GM_addStyle
// @match        *://*/*
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    let isForceCopyEnabled = true;

    // Create status banner
    const banner = document.createElement('div');
    banner.id = 'force-copy-banner';
    banner.textContent = 'Force Copy enabled - Click to disable';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.color = 'white';
    banner.style.padding = '8px 16px';
    banner.style.borderRadius = '0 0 8px 8px';
    banner.style.cursor = 'pointer';
    banner.style.zIndex = '999999';
    banner.style.transition = 'all 0.3s ease';
    banner.dataset.state = 'enabled';
    banner.classList.add('force-copy-enabled');
    GM_addStyle(`
      #force-copy-banner.force-copy-enabled {
        background-color: #4CAF50;
      }
      #force-copy-banner.force-copy-disabled {
        background-color: rgba(200, 200, 200);
      }
    `);
    document.body.prepend(banner);

    banner.addEventListener('click', () => {
      isForceCopyEnabled = !isForceCopyEnabled;
      if (isForceCopyEnabled) {
        banner.classList.remove('force-copy-disabled');
        banner.classList.add('force-copy-enabled');
        banner.textContent = 'Force Copy enabled - Click to disable';
      } else {
        banner.classList.remove('force-copy-enabled');
        banner.classList.add('force-copy-disabled');
        banner.textContent = 'Force Copy disabled - Click to enable';
      }
      updateForceCopyState();
    });

    // CSS element for user-select control
    let css = document.createElement("style");
    document.head.appendChild(css);
    // Event handling configuration
    const events = ["contextmenu", "copy", "paste", "mouseup", "mousedown", "drag", "dragstart", "select", "selectstart", "selectionchange"];
    function disablePropagation(e) {
      e.stopImmediatePropagation();
      return true;
    }

    function updateForceCopyState() {
      if (isForceCopyEnabled) {
        css.innerText = `* {
          -webkit-user-select: text !important;
          -ms-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }`;
        events.forEach(event => {
          document.addEventListener(event, disablePropagation, true);
        });
      } else {
        css.innerText = '';
        events.forEach(event => {
          document.removeEventListener(event, disablePropagation, true);
        });
      }
    }
    updateForceCopyState();
})();
