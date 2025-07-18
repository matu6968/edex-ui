class Netstat {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        // Create DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_netstat">
            <div id="mod_netstat_inner">
                <h1>NETWORK STATUS<i id="mod_netstat_iname"></i></h1>
                <div id="mod_netstat_innercontainer">
                    <div>
                        <h1>STATE</h1>
                        <h2>UNKNOWN</h2>
                    </div>
                    <div>
                        <h1>IPv4</h1>
                        <h2>--.--.--.--</h2>
                    </div>
                    <div>
                        <h1>PING</h1>
                        <h2>--ms</h2>
                    </div>
                </div>
            </div>
        </div>`;

        this.offline = false;
        this.lastconn = {finished: false}; // Prevent geoip lookup attempt until maxminddb is loaded
        this.iface = null;
        this.failedAttempts = {};
        this.runsBeforeGeoIPUpdate = 0;

        // Create HTTPS agent with proxy support
        this._httpsAgent = this._createProxyAgent();

        // Init updaters
        this.updateInfo();
        this.infoUpdater = setInterval(() => {
            this.updateInfo();
        }, 2000);

        // Init GeoIP integrated backend with geolite2-redist v3 compatibility
        console.log("Initializing GeoIP with geolite2-redist v3 API...");
        this.geoLookup = {
            get: () => null
        };
        
        // Initialize GeoIP with proper error handling for v3 API
        setTimeout(() => {
            try {
                const geolite2 = require("geolite2-redist");
                const maxmind = require("maxmind");
                const path = require("path");
                
                // Check if we can use the v3 API
                if (typeof geolite2.open === 'function') {
                    console.log("Using geolite2-redist v3 API...");
                    // Try to open the database synchronously
                    const dbPath = path.join(require("@electron/remote").app.getPath("userData"), "geoIPcache", "GeoLite2-City.mmdb");
                    
                    // Check if database exists first
                    require("fs").access(dbPath, require("fs").constants.F_OK, (err) => {
                        if (!err) {
                            console.log("Found existing GeoIP database, opening...");
                            maxmind.open(dbPath).then(lookup => {
                                this.geoLookup = lookup;
                                console.log("GeoIP lookup initialized successfully");
                            }).catch(e => {
                                console.log("Failed to open existing GeoIP database:", e.message);
                            });
                        } else {
                            console.log("No existing GeoIP database found, location features will be limited");
                        }
                    });
                } else {
                    console.log("geolite2-redist v3 API not available, location features disabled");
                }
            } catch (e) {
                console.log("GeoIP initialization error:", e.message);
                console.log("Location features will be limited");
            }
        }, 1000); // Delay to ensure app is fully initialized
        
        this.lastconn.finished = true;
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
                console.log(`Using HTTPS proxy: ${httpsProxy}`);
                return new HttpsProxyAgent(httpsProxy);
            } catch (e) {
                console.log("https-proxy-agent not available, falling back to direct connection");
            }
        }
        
        // Fallback to regular HTTPS agent
        return new https.Agent({
            keepAlive: false,
            maxSockets: 10
        });
    }
    updateInfo() {
        window.si.networkInterfaces().then(async data => {
            let offline = false;

            let net = data[0];
            let netID = 0;

            if (typeof window.settings.iface === "string") {
                while (net.iface !== window.settings.iface) {
                    netID++;
                    if (data[netID]) {
                        net = data[netID];
                    } else {
                        // No detected interface has the custom iface name, fallback to automatic detection on next loop
                        window.settings.iface = false;
                        return false;
                    }
                }
            } else {
                // Find the first external, IPv4 connected networkInterface that has a MAC address set

                while (net.operstate !== "up" || net.internal === true || net.ip4 === "" || net.mac === "") {
                    netID++;
                    if (data[netID]) {
                        net = data[netID];
                    } else {
                        // No external connection!
                        this.iface = null;
                        document.getElementById("mod_netstat_iname").innerText = "Interface: (offline)";

                        this.offline = true;
                        document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                        document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--.--.--.--";
                        document.querySelector("#mod_netstat_innercontainer > div:nth-child(3) > h2").innerHTML = "--ms";
                        break;
                    }
                }
            }

            if (net.ip4 !== this.internalIPv4) this.runsBeforeGeoIPUpdate = 0;

            this.iface = net.iface;
            this.internalIPv4 = net.ip4;
            document.getElementById("mod_netstat_iname").innerText = "Interface: "+net.iface;

            if (net.ip4 === "127.0.0.1") {
                offline = true;
            } else {
                if (this.runsBeforeGeoIPUpdate === 0 && this.lastconn.finished) {
                    this.lastconn = require("https").get({host: "myexternalip.com", port: 443, path: "/json", localAddress: net.ip4, agent: this._httpsAgent}, res => {
                        let rawData = "";
                        res.on("data", chunk => {
                            rawData += chunk;
                        });
                        res.on("end", () => {
                            try {
                                let data = JSON.parse(rawData);
                                let geoResult = this.geoLookup.get(data.ip);
                                this.ipinfo = {
                                    ip: data.ip,
                                    geo: geoResult ? geoResult.location : null
                                };

                                let ip = this.ipinfo.ip;
                                document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = window._escapeHtml(ip);

                                this.runsBeforeGeoIPUpdate = 10;
                            } catch(e) {
                                this.failedAttempts[e] = (this.failedAttempts[e] || 0) + 1;
                                if (this.failedAttempts[e] > 2) return false;
                                console.warn(e);
                                console.info(rawData.toString());
                                let electron = require("electron");
                                electron.ipcRenderer.send("log", "note", "NetStat: Error parsing data from myexternalip.com");
                                electron.ipcRenderer.send("log", "debug", `Error: ${e}`);
                            }
                        });
                    }).on("error", e => {
                        // Drop it
                    });
                } else if (this.runsBeforeGeoIPUpdate !== 0) {
                    this.runsBeforeGeoIPUpdate = this.runsBeforeGeoIPUpdate - 1;
                }

                let p = await this.ping(window.settings.pingAddr || "1.1.1.1", 80, net.ip4).catch(() => { offline = true });

                this.offline = offline;
                if (offline) {
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "OFFLINE";
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(2) > h2").innerHTML = "--.--.--.--";
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(3) > h2").innerHTML = "--ms";
                } else {
                    document.querySelector("#mod_netstat_innercontainer > div:first-child > h2").innerHTML = "ONLINE";
                    document.querySelector("#mod_netstat_innercontainer > div:nth-child(3) > h2").innerHTML = Math.round(p)+"ms";
                }
            }
        });
    }
    ping(target, port, local) {
        return new Promise((resolve, reject) => {
            let s = new require("net").Socket();
            let start = process.hrtime();

            s.connect({
                port,
                host: target,
                localAddress: local,
                family: 4
            }, () => {
                let time_arr = process.hrtime(start);
                let time = (time_arr[0] * 1e9 + time_arr[1]) / 1e6;
                resolve(time);
                s.destroy();
            });
            s.on('error', e => {
                s.destroy();
                reject(e);
            });
            s.setTimeout(1900, function() {
                s.destroy();
                reject(new Error("Socket timeout"));
            });
        });
    }
}

module.exports = {
    Netstat
};
