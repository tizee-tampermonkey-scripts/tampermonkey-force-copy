// ==UserScript==
// @name         force-copy
// @namespace    https://github.com/tizee-tampermonkey-scripts/tampermonkey-force-copy
// @downloadURL  https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-force-copy/refs/heads/main/force-copy.js
// @updateURL    https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-force-copy/refs/heads/main/force-copy.js
// @version      1.3
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
    banner.innerHTML = `
        <div class="banner-content">Force Copy enabled - Click to disable</div>
        <div class="banner-toggle"></div>
        <div class="dropdown-triangle"></div>
    `;
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.color = 'white';
    banner.style.cursor = 'pointer';
    banner.style.zIndex = '999999';
    banner.style.transition = 'all 0.3s ease';
    banner.dataset.state = 'enabled';
    // Default to pinned state
    banner.classList.add('pinned');
    // Load saved state from localStorage
    const savedPinnedState = localStorage.getItem('forceCopyBannerPinned');
    if (savedPinnedState === 'false') {
      banner.classList.remove('pinned');
    }
    banner.classList.add('force-copy-enabled');
    GM_addStyle(`
      #force-copy-banner {
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        overflow: visible;
        max-height: 40px;
        min-width: 200px;
        position: relative;
        padding: 8px 16px;
      }
      #force-copy-banner:not(.pinned) {
        max-height: 0;
        padding: 0px;
        min-width: 0;
        width: 0;
        overflow: visible;
      }
      #force-copy-banner.force-copy-enabled {
        background-color: #4CAF50;
      }
      #force-copy-banner.force-copy-disabled {
        background-color: #f44336;
      }
      .banner-content {
        flex: 1;
        transition: opacity 0.3s ease;
        white-space: nowrap;
        padding: 0px;
      }
      #force-copy-banner:not(.pinned) .banner-content {
        display: none;
      }
      .banner-toggle {
        cursor: pointer;
        margin-left: 8px;
        padding: 2px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transition: all 0.3s ease;
        border-radius: 2px;
      }
      #force-copy-banner.pinned .banner-toggle {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.9711 17.1715 19.5568 18.5858 16.0223 15.0513 15.9486 15.125 15.2415 18.6605 13.8273 20.0747 9.58466 15.8321 4.63492 20.7818 3.2207 19.3676 8.17045 14.4179 3.92781 10.1752 5.34202 8.76101 8.87756 8.0539 8.95127 7.98019 5.4147 4.44362 6.82892 3.02941 20.9711 17.1715ZM18.8508 12.2228 20.1913 10.8823 20.8984 11.5894 22.3126 10.1752 13.8273 1.68994 12.4131 3.10416 13.1202 3.81126 11.7797 5.15176 18.8508 12.2228Z'/%3E%3C/svg%3E");
      }
      #force-copy-banner:not(.pinned) .banner-toggle {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M13.8273 1.69L22.3126 10.1753L20.8984 11.5895L20.1913 10.8824L15.9486 15.125L15.2415 18.6606L13.8273 20.0748L9.58466 15.8321L4.63492 20.7819L3.2207 19.3677L8.17045 14.4179L3.92781 10.1753L5.34202 8.76107L8.87756 8.05396L13.1202 3.81132L12.4131 3.10422L13.8273 1.69ZM14.5344 5.22554L9.86358 9.89637L7.0417 10.4607L13.5418 16.9609L14.1062 14.139L18.7771 9.46818L14.5344 5.22554Z'/%3E%3C/svg%3E");
      }
      .banner-toggle:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }
      #force-copy-banner:not(.pinned) .banner-toggle {
        display: none;
      }
      #force-copy-banner:hover:not(.pinned) .banner-toggle {
        display: block;
      }
      .dropdown-triangle {
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      #force-copy-banner.force-copy-enabled .dropdown-triangle {
        border-top-color: #4CAF50;
      }
      #force-copy-banner.force-copy-disabled .dropdown-triangle {
        border-top-color: #f44336;
      }
      #force-copy-banner.pinned .dropdown-triangle {
        display: none;
      }
      #force-copy-banner:hover:not(.pinned) {
        max-height: 40px;
        width: auto;
        padding: 8px 16px;
        border-radius: 0 0 8px 8px;
      }
      #force-copy-banner:hover:not(.pinned) .banner-content {
        display: block;
      }
      #force-copy-banner:hover:not(.pinned) .dropdown-triangle {
        display: none;
      }
    `);
    document.body.prepend(banner);

    // Toggle button handler (pin/unpin)
    banner.querySelector('.banner-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      banner.classList.toggle('pinned');
      localStorage.setItem('forceCopyBannerPinned', banner.classList.contains('pinned'));
    });

    // Main banner click handler (enable/disable force copy)
    banner.addEventListener('click', (e) => {
      // Don't toggle if clicking on toggle button
      if (e.target.classList.contains('banner-toggle')) {
        return;
      }

      isForceCopyEnabled = !isForceCopyEnabled;
      if (isForceCopyEnabled) {
        banner.classList.remove('force-copy-disabled');
        banner.classList.add('force-copy-enabled');
        banner.querySelector('.banner-content').textContent = 'Force Copy enabled - Click to disable';
      } else {
        banner.classList.remove('force-copy-enabled');
        banner.classList.add('force-copy-disabled');
        banner.querySelector('.banner-content').textContent = 'Force Copy disabled - Click to enable';
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
