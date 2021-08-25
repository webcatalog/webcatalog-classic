/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const { app, BrowserWindow, session } = require('electron');
const contextMenu = require('electron-context-menu');

const getChromeUserAgent = () => {
  // Hide Electron from UA to improve compatibility
  // https://github.com/webcatalog/webcatalog-app/issues/182
  const chromeUa = app.userAgentFallback
    // Fix WhatsApp requires Google Chrome 49+ bug
    // App Name doesn't have white space in user agent. 'Google Chat' app > GoogleChat/8.1.1
    .replace(` ${app.name.replace(/ /g, '')}/${app.getVersion()}`, '')
    // Hide Electron from UA to improve compatibility
    // https://github.com/webcatalog/webcatalog-app/issues/182
    .replace(` Electron/${process.versions.electron}`, '');

  return chromeUa;
};

// fix Google prevents signing in because of security concerns
// https://github.com/webcatalog/webcatalog-app/issues/455
// https://github.com/meetfranz/franz/issues/1720#issuecomment-566460763
const getFakeFirefoxUserAgent = () => {
  const fakedFirefoxUaStr = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0';
  return fakedFirefoxUaStr;
};

const getAuthTokenWithPopupAsync = () => new Promise((resolve, reject) => {
  const ses = session.fromPartition(`auth-temp-${Date.now()}`);
  ses.setUserAgent(getChromeUserAgent());
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      session: ses,
      nativeWindowOpen: true,
    },
  });

  contextMenu({ window: win });

  win.webContents.on('did-create-window', (childWindow) => {
    contextMenu({ window: childWindow });
    childWindow.webContents.on('will-navigate', (e, url) => {
      // fix Google prevents signing in because of security concerns
      if (url && url.includes('providerId=google.com')) {
        const fakeEdgeUa = getFakeFirefoxUserAgent();
        if (e.sender.userAgent !== fakeEdgeUa) {
          e.preventDefault();
          e.sender.setUserAgent(getFakeFirefoxUserAgent());
          e.sender.loadURL(url);
        }
      }
    });
  });

  win.webContents.setWindowOpenHandler((details) => {
    if (details.url) {
      const urlObj = new URL(details.url);
      if (urlObj.pathname === '/account/token/in-app/success') {
        const token = urlObj.searchParams.get('token');
        if (token) {
          resolve(token);
          win.close();
        } else {
          reject(new Error('token is not retrieved'));
          win.close();
        }
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  win.loadURL('https://webcatalog.io/account/token/in-app/');

  win.on('did-fail-load', () => {
    reject(new Error('did-fail-load'));
    win.close();
  });

  win.on('closed', () => {
    reject(new Error('Window is closed'));
  });
});

module.exports = getAuthTokenWithPopupAsync;
