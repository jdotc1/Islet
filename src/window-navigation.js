"use strict";

// Do not let renderer-driven navigation load a different page with Islet's
// privileged preload APIs. Programmatic loadFile calls remain unaffected.
function preventExternalNavigation(window) {
  window.webContents.on("will-navigate", event => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
}

module.exports = { preventExternalNavigation };
