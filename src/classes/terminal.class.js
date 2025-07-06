class Terminal {
    constructor(opts) {
        if (opts.role === "client") {
            if (!opts.parentId) throw "Missing options";

            this.xTerm = require("@xterm/xterm").Terminal;
            const {AttachAddon} = require("@xterm/addon-attach");
            const {FitAddon} = require("@xterm/addon-fit");
            const {LigaturesAddon} = require("@xterm/addon-ligatures");
            const {WebglAddon} = require("@xterm/addon-webgl");
            this.Ipc = require("electron").ipcRenderer;

            this.port = opts.port || 3000;
            this.cwd = "";
            this.oncwdchange = () => {};

            this._sendSizeToServer = () => {
                let cols = this.term.cols.toString();
                let rows = this.term.rows.toString();
                while (cols.length < 3) {
                    cols = "0"+cols;
                }
                while (rows.length < 3) {
                    rows = "0"+rows;
                }
                this.Ipc.send("terminal_channel-"+this.port, "Resize", cols, rows);
            };

            // Support for custom color filters on the terminal - see #483
            let doCustomFilter = (window.isTermFilterValidated) ? true : false;

            // Parse & validate color filter
            if (window.isTermFilterValidated !== true && typeof window.theme.terminal.colorFilter === "object" && window.theme.terminal.colorFilter.length > 0) {
                doCustomFilter = window.theme.terminal.colorFilter.every((step, i, a) => {
                    let func = step.slice(0, step.indexOf("("));

                    switch(func) {
                        case "negate":
                        case "grayscale":
                            a[i] = {
                                func,
                                arg: []
                            };
                            return true;
                        case "lighten":
                        case "darken":
                        case "saturate":
                        case "desaturate":
                        case "whiten":
                        case "blacken":
                        case "fade":
                        case "opaquer":
                        case "rotate":
                        case "mix":
                            break;
                        default:
                            return false;
                    }

                    let arg = step.slice(step.indexOf("(")+1, step.indexOf(")"));

                    if (typeof Number(arg) === "number") {
                        a[i] = {
                            func,
                            arg: [Number(arg)]
                        };
                        window.isTermFilterValidated = true;
                        return true;
                    }

                    return false;
                });
            }

            let color = require("color");
            let colorify;
            if (doCustomFilter) {
                colorify = (base, target) => {
                    let newColor = color(base);
                    target = color(target);

                    for (let i = 0; i < window.theme.terminal.colorFilter.length; i++) {
                        if (window.theme.terminal.colorFilter[i].func === "mix") {
                            newColor = newColor[window.theme.terminal.colorFilter[i].func](target, ...window.theme.terminal.colorFilter[i].arg);
                        } else {
                            newColor = newColor[window.theme.terminal.colorFilter[i].func](...window.theme.terminal.colorFilter[i].arg);
                        }
                    }

                    return newColor.hex();
                };
            } else {
                colorify = (base, target) => {
                    return color(base).grayscale().mix(color(target), 0.3).hex();
                };
            }

            let themeColor = `rgb(${window.theme.r}, ${window.theme.g}, ${window.theme.b})`;

            this.term = new this.xTerm({
                cols: 80,
                rows: 24,
                cursorBlink: window.theme.terminal.cursorBlink || true,
                cursorStyle: window.theme.terminal.cursorStyle || "block",
                allowTransparency: false, // Disable transparency to fix blue tint in @xterm v5
                allowProposedApi: true, // Required for @xterm/xterm v5+ addons
                convertEol: true, // Ensure proper line ending handling
                fontFamily: window.theme.terminal.fontFamily || "Fira Mono",
                fontSize: window.theme.terminal.fontSize || window.settings.termFontSize || 15,
                fontWeight: window.theme.terminal.fontWeight || "normal",
                fontWeightBold: window.theme.terminal.fontWeightBold || "bold",
                letterSpacing: window.theme.terminal.letterSpacing || 0,
                lineHeight: window.theme.terminal.lineHeight || 1,
                scrollback: 1500,
                bellStyle: "none",
                theme: {
                    foreground: window.theme.terminal.foreground,
                    background: window.theme.terminal.background,
                    cursor: window.theme.terminal.cursor,
                    cursorAccent: window.theme.terminal.cursorAccent,
                    selection: window.theme.terminal.selection,
                    black: window.theme.colors.black || colorify("#2e3436", themeColor),
                    red: window.theme.colors.red || colorify("#cc0000", themeColor),
                    green: window.theme.colors.green || colorify("#4e9a06", themeColor),
                    yellow: window.theme.colors.yellow || colorify("#c4a000", themeColor),
                    blue: window.theme.colors.blue || colorify("#3465a4", themeColor),
                    magenta: window.theme.colors.magenta || colorify("#75507b", themeColor),
                    cyan: window.theme.colors.cyan || colorify("#06989a", themeColor),
                    white: window.theme.colors.white || colorify("#d3d7cf", themeColor),
                    brightBlack: window.theme.colors.brightBlack || colorify("#555753", themeColor),
                    brightRed: window.theme.colors.brightRed || colorify("#ef2929", themeColor),
                    brightGreen: window.theme.colors.brightGreen || colorify("#8ae234", themeColor),
                    brightYellow: window.theme.colors.brightYellow || colorify("#fce94f", themeColor),
                    brightBlue: window.theme.colors.brightBlue || colorify("#729fcf", themeColor),
                    brightMagenta: window.theme.colors.brightMagenta || colorify("#ad7fa8", themeColor),
                    brightCyan: window.theme.colors.brightCyan || colorify("#34e2e2", themeColor),
                    brightWhite: window.theme.colors.brightWhite || colorify("#eeeeec", themeColor)
                }
            });
            let fitAddon = new FitAddon();
            this.term.loadAddon(fitAddon);
            this.term.open(document.getElementById(opts.parentId));
            // Disable WebGL addon to fix blue tint issue in @xterm v5
            // this.term.loadAddon(new WebglAddon());
            let ligaturesAddon = new LigaturesAddon();
            this.term.loadAddon(ligaturesAddon);
            this.term.attachCustomKeyEventHandler(e => {
                window.keyboard.keydownHandler(e);
                return true;
            });
            // Prevent soft-keyboard on touch devices #733
            document.querySelectorAll('.xterm-helper-textarea').forEach(textarea => textarea.setAttribute('readonly', 'readonly'))
            this.term.focus();

            this.Ipc.send("terminal_channel-"+this.port, "Renderer startup");
            this.Ipc.on("terminal_channel-"+this.port, (e, ...args) => {
                switch(args[0]) {
                    case "New cwd":
                        this.cwd = args[1];
                        this.oncwdchange(this.cwd);
                        break;
                    case "Fallback cwd":
                        this.cwd = "FALLBACK |-- "+args[1];
                        this.oncwdchange(this.cwd);
                        break;
                    case "New process":
                        if (this.onprocesschange) {
                            this.onprocesschange(args[1]);
                        }
                        break;
                    default:
                        return;
                }
            });
            this.resendCWD = () => {
                this.oncwdchange(this.cwd || null);
            };

            let sockHost = opts.host || "127.0.0.1";
            let sockPort = this.port;

            this.socket = new WebSocket("ws://"+sockHost+":"+sockPort);
            this.socket.onopen = () => {
                let attachAddon = new AttachAddon(this.socket);
                this.term.loadAddon(attachAddon);
                this.fit();
            };
            this.socket.onerror = e => {throw JSON.stringify(e)};
            this.socket.onclose = e => {
                if (this.onclose) {
                    this.onclose(e);
                }
            };

            this.lastSoundFX = Date.now();
            this.socket.addEventListener("message", e => {
                let d = Date.now();

                if (d - this.lastSoundFX > 30) {
                    if(window.passwordMode == "false")
                        window.audioManager.stdout.play();
                    this.lastSoundFX = d;
                }
                if (d - this.lastRefit > 10000) {
                    this.fit();
                }

                // See #397
                if (!window.settings.experimentalGlobeFeatures) return;
                let ips = e.data.match(/((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g);
                if (ips !== null && ips.length >= 1) {
                    ips = ips.filter((val, index, self) => { return self.indexOf(val) === index; });
                    ips.forEach(ip => {
                        window.mods.globe.addTemporaryConnectedMarker(ip);
                    });
                }
            });

            let parent = document.getElementById(opts.parentId);
            parent.addEventListener("wheel", e => {
                this.term.scrollLines(Math.round(e.deltaY/10));
            });
            this._lastTouchY = null;
            parent.addEventListener("touchstart", e => {
                this._lastTouchY = e.targetTouches[0].screenY;
            });
            parent.addEventListener("touchmove", e => {
                if (this._lastTouchY) {
                    let y = e.changedTouches[0].screenY;
                    let deltaY = y - this._lastTouchY;
                    this._lastTouchY = y;
                    this.term.scrollLines(-Math.round(deltaY/10));
                }
            });
            parent.addEventListener("touchend", e => {
                this._lastTouch = null;
            });
            parent.addEventListener("touchcancel", e => {
                this._lastTouch = null;
            });

            document.querySelector(".xterm-helper-textarea").addEventListener("keydown", e => {
                if (e.key === "F11" && window.settings.allowWindowed) {
                    e.preventDefault();
                    window.toggleFullScreen();
                }
            });

            this.fit = () => {
                this.lastRefit = Date.now();
                let {cols, rows} = fitAddon.proposeDimensions();

                // Apply custom fixes based on screen ratio, see #302
                let w = screen.width;
                let h = screen.height;
                let x = 1;
                let y = 0;

                function gcd(a, b) {
                    return (b == 0) ? a : gcd(b, a%b);
                }
                let d = gcd(w, h);

                if (d === 100) { y = 1; x = 3;}
                // if (d === 120) y = 1;
                if (d === 256) x = 2;

                if (window.settings.termFontSize < 15) y = y - 1;

                cols = cols+x;
                rows = rows+y;

                if (this.term.cols !== cols || this.term.rows !== rows) {
                    this.resize(cols, rows);
                }
            };

            this.resize = (cols, rows) => {
                this.term.resize(cols, rows);
                this._sendSizeToServer();
            };

            this.write = cmd => {
                this.socket.send(cmd);
            };

            this.writelr = cmd => {
                this.socket.send(cmd+"\r");
            };

            this.clipboard = {
                copy: () => {
                    if (!this.term.hasSelection()) return false;
                    document.execCommand("copy");
                    this.term.clearSelection();
                    this.clipboard.didCopy = true;
                },
                paste: () => {
                    this.write(remote.clipboard.readText());
                    this.clipboard.didCopy = false;
                },
                didCopy: false
            };

        } else if (opts.role === "server") {

            this.Pty = require("@lydell/node-pty");
            this.Websocket = require("ws").Server;
            this.Ipc = require("electron").ipcMain;

            this.renderer = null;
            this.port = opts.port || 3000;

            this._closed = false;
            this.onclosed = () => {};
            this.onopened = () => {};
            this.onresize = () => {};
            this.ondisconnected = () => {};

            this._disableCWDtracking = false;
            this._windowsCwd = null; // Track current working directory on Windows
            this._getTtyCWD = tty => {
                return new Promise((resolve, reject) => {
                    let pid = tty._pid;
                    switch(require("os").type()) {
                        case "Linux":
                            require("fs").readlink(`/proc/${pid}/cwd`, (e, cwd) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(cwd);
                                }
                            });
                            break;
                        case "Darwin":
                            require("child_process").exec(`lsof -a -d cwd -p ${pid} | tail -1 | awk '{ for (i=9; i<=NF; i++) printf "%s ", $i }'`, (e, cwd) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(cwd.trim());
                                }
                            });
                            break;
                        case "Windows_NT":
                            // For Windows, we'll use a simpler approach by tracking directory changes
                            // through the PTY data stream instead of querying the process directly
                            // This is more reliable as it captures actual shell directory changes
                            if (this._windowsCwd) {
                                resolve(this._windowsCwd);
                            } else {
                                // Use current working directory as fallback
                                resolve(opts.cwd || process.env.USERPROFILE || process.env.CD || "C:\\");
                            }
                            break;
                        default:
                            reject("Unsupported OS");
                    }
                });
            };
            this._getTtyProcess = tty => {
                return new Promise((resolve, reject) => {
                    let pid = tty._pid;
                    switch(require("os").type()) {
                        case "Linux":
                        case "Darwin":
                            require("child_process").exec(`ps -o comm --no-headers --sort=+pid -g ${pid} | tail -1`, (e, proc) => {
                                if (e !== null) {
                                    reject(e);
                                } else {
                                    resolve(proc.trim());
                                }
                            });
                            break;
                        case "Windows_NT":
                            // Use tasklist to get the process name on Windows
                            require("child_process").exec(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, (e, output) => {
                                if (e !== null) {
                                    // Fallback to generic shell name
                                    resolve(require("path").basename(opts.shell || "powershell.exe", ".exe"));
                                } else {
                                    try {
                                        // Parse CSV output to get process name
                                        const lines = output.trim().split('\n');
                                        if (lines.length > 0) {
                                            const processName = lines[0].split(',')[0].replace(/"/g, '');
                                            resolve(require("path").basename(processName, ".exe"));
                                        } else {
                                            resolve(require("path").basename(opts.shell || "powershell.exe", ".exe"));
                                        }
                                    } catch (parseError) {
                                        resolve(require("path").basename(opts.shell || "powershell.exe", ".exe"));
                                    }
                                }
                            });
                            break;
                        default:
                            reject("Unsupported OS");
                    }
                });
            };
            
            // Windows-specific method to parse terminal output for directory changes
            this._parseWindowsDirectoryChange = (data) => {
                if (!data || typeof data !== 'string') return;
                
                try {
                    // Look for PowerShell prompts that contain the current directory
                    // PowerShell typically shows: PS C:\Path\To\Directory>
                    const psPromptMatch = data.match(/PS\s+([A-Z]:[^\r\n>]+)>/);
                    if (psPromptMatch) {
                        const newPath = psPromptMatch[1].trim();
                        if (newPath !== this._windowsCwd) {
                            this._windowsCwd = newPath;
                            return;
                        }
                    }
                    
                    // Look for CMD prompts that contain the current directory
                    // CMD typically shows: C:\Path\To\Directory>
                    const cmdPromptMatch = data.match(/^([A-Z]:[^\r\n>]+)>/m);
                    if (cmdPromptMatch) {
                        const newPath = cmdPromptMatch[1].trim();
                        if (newPath !== this._windowsCwd) {
                            this._windowsCwd = newPath;
                            return;
                        }
                    }
                    
                    // Look for cd command execution and capture the resulting directory
                    // This catches cases where the user types 'cd' to see current directory
                    const cdOutputMatch = data.match(/^([A-Z]:[^\r\n]+)[\r\n]/m);
                    if (cdOutputMatch && !data.includes('>') && !data.includes('PS ')) {
                        const newPath = cdOutputMatch[1].trim();
                        if (newPath.length > 3 && newPath !== this._windowsCwd) { // Minimum valid path length
                            this._windowsCwd = newPath;
                            return;
                        }
                    }
                } catch (e) {
                    // Ignore parsing errors - they won't affect terminal functionality
                }
            };
            
            this._nextTickUpdateTtyCWD = false;
            this._nextTickUpdateProcess = false;
            this._tick = setInterval(() => {
                if (this._nextTickUpdateTtyCWD && this._disableCWDtracking === false) {
                    this._nextTickUpdateTtyCWD = false;
                    this._getTtyCWD(this.tty).then(cwd => {
                        if (this.tty._cwd === cwd) return;
                        this.tty._cwd = cwd;
                        if (this.renderer) {
                            this.renderer.send("terminal_channel-"+this.port, "New cwd", cwd);
                        }
                    }).catch(e => {
                        if (!this._closed) {
                            console.log("Error while tracking TTY working directory: ", e);
                            this._disableCWDtracking = true;
                            try {
                                this.renderer.send("terminal_channel-"+this.port, "Fallback cwd", opts.cwd || process.env.PWD);
                            } catch(e) {
                                // renderer closed
                            }
                        }
                    });
                }

                if (this.renderer && this._nextTickUpdateProcess) {
                    this._nextTickUpdateProcess = false;
                    this._getTtyProcess(this.tty).then(process => {
                        if (this.tty._process === process) return;
                        this.tty._process = process;
                        if (this.renderer) {
                            this.renderer.send("terminal_channel-"+this.port, "New process", process);
                        }
                    }).catch(e => {
                        if (!this._closed) {
                            console.log("Error while retrieving TTY subprocess: ", e);
                            try {
                                this.renderer.send("terminal_channel-"+this.port, "New process", "");
                            } catch(e) {
                                // renderer closed
                            }
                        }
                    });
                }
            }, 1000);

            this.tty = this.Pty.spawn(opts.shell || "bash", (opts.params.length > 0 ? opts.params : (process.platform === "win32" ? [] : ["--login"])), {
                name: opts.env.TERM || "xterm-256color",
                cols: 80,
                rows: 24,
                cwd: opts.cwd || process.env.PWD,
                env: opts.env || process.env
            });
            
            // Initialize Windows CWD tracking with the starting directory
            if (require("os").type() === "Windows_NT") {
                this._windowsCwd = opts.cwd || process.env.USERPROFILE || "C:\\";
            }

            this.tty.onExit((code, signal) => {
                this._closed = true;
                this.onclosed(code, signal);
            });

            this.wss = new this.Websocket({
                port: this.port,
                clientTracking: true,
                verifyClient: info => {
                    if (this.wss.clients.length >= 1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            });
            this.Ipc.on("terminal_channel-"+this.port, (e, ...args) => {
                switch(args[0]) {
                    case "Renderer startup":
                        this.renderer = e.sender;
                        if (!this._disableCWDtracking && this.tty._cwd) {
                            this.renderer.send("terminal_channel-"+this.port, "New cwd", this.tty._cwd);
                        }
                        if (this._disableCWDtracking) {
                            this.renderer.send("terminal_channel-"+this.port, "Fallback cwd", opts.cwd || process.env.PWD);
                        }
                        break;
                    case "Resize":
                        let cols = args[1];
                        let rows = args[2];
                        try {
                            this.tty.resize(Number(cols), Number(rows));
                        } catch (error) {
                            //Keep going, it'll work anyways.
                        }
                        this.onresized(cols, rows);
                        break;
                    default:
                        return;
                }
            });
            this.wss.on("connection", ws => {
                this.onopened(this.tty._pid);
                ws.on("close", (code, reason) => {
                    if (this.ondisconnected && typeof this.ondisconnected === 'function') {
                        this.ondisconnected(code, reason);
                    }
                });
                ws.on("message", msg => {
                    // Sanitize input to prevent code injection while allowing legitimate terminal input
                    // Security: All WebSocket messages are validated before being passed to the PTY
                    if (this._isValidTerminalInput(msg)) {
                        // Convert Buffer to string if needed for PTY compatibility
                        const sanitizedMsg = Buffer.isBuffer(msg) ? msg.toString('utf8') : msg;
                        this.tty.write(sanitizedMsg);
                    } else {
                        console.warn("Received invalid or potentially unsafe message:", msg);
                    }
                });
                this.tty.onData(data => {
                    this._nextTickUpdateTtyCWD = true;
                    this._nextTickUpdateProcess = true;
                    
                    // Windows-specific directory tracking by parsing terminal output
                    if (require("os").type() === "Windows_NT") {
                        this._parseWindowsDirectoryChange(data);
                    }
                    
                    try {
                        ws.send(data);
                    } catch (e) {
                        // Websocket closed
                    }
                });
            });

            this.close = () => {
                if (this.tty && this.tty.kill) {
                    this.tty.kill();
                }
                this._closed = true;
                if (this._tick) {
                    clearInterval(this._tick);
                }
            };

            /**
             * Validate terminal input to prevent code injection while allowing legitimate terminal operations
             * This function sanitizes WebSocket messages before passing them to the PTY
             * 
             * Security measures:
             * - Validates input type and length
             * - Allows printable characters and essential control characters
             * - Blocks null bytes and suspicious escape sequences
             * - Prevents potential DoS attacks with length limits
             * 
             * @param {string|Buffer} msg - The message from WebSocket
             * @returns {boolean} - True if input is safe for terminal use
             */
            this._isValidTerminalInput = (msg) => {
                // Handle Buffer objects from WebSocket
                if (Buffer.isBuffer(msg)) {
                    // Convert buffer to string for validation
                    try {
                        msg = msg.toString('utf8');
                    } catch (e) {
                        return false;
                    }
                }

                // Must be a string at this point
                if (typeof msg !== "string") {
                    return false;
                }

                // Reject empty strings or extremely long inputs (potential DoS)
                if (msg.length === 0 || msg.length > 8192) {
                    return false;
                }

                // Allow legitimate terminal input including:
                // - Printable ASCII and extended ASCII characters (0x20-0xFF)
                // - Common control characters used in terminals
                // - Unicode characters for internationalization
                const allowedControlChars = [
                    0x08, // Backspace
                    0x09, // Tab
                    0x0A, // Line Feed (LF)
                    0x0D, // Carriage Return (CR)
                    0x1B, // Escape (for ANSI sequences)
                    0x7F  // Delete
                ];

                for (let i = 0; i < msg.length; i++) {
                    const charCode = msg.charCodeAt(i);
                    
                    // Allow printable characters (space and above)
                    if (charCode >= 0x20) {
                        continue;
                    }
                    
                    // Allow specific control characters
                    if (allowedControlChars.includes(charCode)) {
                        continue;
                    }
                    
                    // Reject other control characters that could be malicious
                    return false;
                }

                // Additional checks for potentially dangerous patterns
                // Reject null bytes (often used in injection attacks)
                if (msg.includes('\0')) {
                    return false;
                }

                // Reject suspicious escape sequences that could be used for injection
                // Allow normal ANSI sequences but reject potentially dangerous ones
                if (msg.includes('\x1b]')) { // OSC (Operating System Command) sequences
                    return false;
                }
                if (msg.includes('\x1b[>')) { // Some potentially dangerous escape sequences
                    return false;
                }

                return true;
            };
        } else {
            throw "Unknown purpose";
        }
    }
}

module.exports = {
    Terminal
};
