class UpdateChecker {
    constructor() {
        let https = require("https");
        let electron = require("electron");
        let remote = require("@electron/remote");
        let current = remote.app.getVersion();

        this._failed = false;
        this._willfail = false;
        this._fail = e => {
            this._failed = true;
            electron.ipcRenderer.send("log", "note", "UpdateChecker: Could not fetch latest release from GitHub's API.");
            electron.ipcRenderer.send("log", "debug", `Error: ${e}`);
        };

        // Create request options with proxy support
        const requestOptions = {
            protocol: "https:",
            host: "api.github.com",
            path: "/repos/matu6968/edex-ui/releases/latest",
            headers: {
                "User-Agent": "eDEX-UI UpdateChecker"
            }
        };

        // Add proxy agent if available
        const agent = this._createProxyAgent();
        if (agent) {
            requestOptions.agent = agent;
        }

        https.get(requestOptions, res => {
            switch(res.statusCode) {
                case 200:
                    break;
                case 404:
                    this._fail("Got 404 (Not Found) response from server");
                    break;
                default:
                    this._willfail = true;
            }

            let rawData = "";

            res.on('data', chunk => {
                rawData += chunk;
            });

            res.on('end', () => {
                let d = rawData;
                if (this._failed === true) {
                    // Do nothing, it already failed
                } else if (this._willfail) {
                    this._fail(d.toString());
                } else {
                    try {
                        let release = JSON.parse(d.toString());
                        if (release.tag_name.slice(1) === current) {
                            electron.ipcRenderer.send("log", "info", "UpdateChecker: Running latest version.");
                        } else if (Number(release.tag_name.slice(1).replace(/\./g, "")) < Number(current.replace("-pre", "").replace(/\./g, ""))) {
                            electron.ipcRenderer.send("log", "info", "UpdateChecker: Running an unreleased, development version.");
                        } else {
                            new Modal({
                                type: "info",
                                title: "New version available",
                                message: `eDEX-UI <strong>${release.tag_name}</strong> is now available.<br/>Head over to <a href="#" onclick="require('electron').shell.openExternal('${release.html_url}')">github.com</a> to download the latest version.`
                            });
                            electron.ipcRenderer.send("log", "info", `UpdateChecker: New version ${release.tag_name} available.`);
                        }
                    } catch(e) {
                        this._fail(e);
                    }
                }
            });
        }).on('error', e => {
            this._fail(e);
        });
    }

    _createProxyAgent() {
        const https = require("https");
        
        // Check if we have stored proxy settings from boot.js
        const proxySettings = global.originalProxySettings || {};
        const httpsProxy = proxySettings.https_proxy || proxySettings.http_proxy;
        
        if (httpsProxy) {
            try {
                // Try to use https-proxy-agent if available (it might be installed as a dependency)
                const HttpsProxyAgent = require("https-proxy-agent");
                console.log(`UpdateChecker using HTTPS proxy: ${httpsProxy}`);
                return new HttpsProxyAgent(httpsProxy);
            } catch (e) {
                console.log("https-proxy-agent not available for UpdateChecker, falling back to direct connection");
            }
        }
        
        // Fallback to regular HTTPS agent
        return new https.Agent({
            keepAlive: false,
            maxSockets: 10
        });
    }
}

module.exports = {
    UpdateChecker
};
