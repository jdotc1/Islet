const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { preventExternalNavigation } = require("../src/window-navigation");

test("blocks renderer navigation and new windows", () => {
  const handlers = new Map();
  let popupHandler;
  const window = {
    webContents: {
      on: (name, handler) => handlers.set(name, handler),
      setWindowOpenHandler: handler => { popupHandler = handler; },
    },
  };

  preventExternalNavigation(window);
  assert.equal(typeof handlers.get("will-navigate"), "function");
  for (const url of ["https://example.com", "file:///tmp/another.html"]) {
    let prevented = false;
    handlers.get("will-navigate")({ preventDefault: () => { prevented = true; } }, url);
    assert.equal(prevented, true, `navigation to ${url} must be blocked`);
  }
  assert.deepEqual(popupHandler({ url: "https://example.com" }), { action: "deny" });
});

test("notch, settings, and welcome windows all install navigation guards", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/main.js"), "utf8");
  const guarded = [...source.matchAll(/preventExternalNavigation\((win|settingsWin|welcomeWin)\)/g)]
    .map(match => match[1]).sort();
  assert.deepEqual(guarded, ["settingsWin", "welcomeWin", "win"]);
});
