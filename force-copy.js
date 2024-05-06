// ==UserScript==
// @name         force-copy
// @namespace    http://tampermonkey.net/
// @version      2024-05-06
// @description  force web to enable copy, context menu
// @author       tizee
// @icon         https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f4dd.png
// @grant        GM_addStyle
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // enable CSS user-select
    let css = document.createElement("style");
    document.head.appendChild(css);
    // chrome prefix: -webkit-
    // Edge prefix: -ms-
    // Safari prefix: -webkit-
    // Firefox prefix: -moz-
    css.innerText = `* {
        -webkit-user-select: text !important;
        -ms-user-select: text !important;
        -moz-user-select: text !important;
        user-select: text !important;
      }`;

   // hook event listeners by disable event propagation
   let events = ["contextmenu", "copy", "paste", "mouseup", "mousedown", "drag", "dragstart", "select", "selectstart", "selectionchange"];
   function disablePropagation(e) {
      e.stopImmediatePropagation();
      return true;
   }

   events.map((event)=>{
      document.addEventListener(event, disablePropagation, true);
   });
})();
