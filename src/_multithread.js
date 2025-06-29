const cluster = require("cluster");

if (cluster.isMaster) {
    const electron = require("electron");
    const ipc = electron.ipcMain;
    const signale = require("signale");
    // Also, leave a core available for the renderer process
    const osCPUs = require("os").cpus().length - 1;
    // See #904
    const numCPUs = (osCPUs > 7) ? 7 : osCPUs;

    const si = require("systeminformation");

    cluster.setupMaster({
        exec: require("path").join(__dirname, "_multithread.js")
    });

    let workers = [];
    cluster.on("fork", worker => {
        workers.push(worker.id);
    });

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    signale.success("Multithreaded controller ready");

    var lastID = 0;

    function dispatch(type, id, arg) {
        let selectedID = lastID+1;
        if (selectedID > numCPUs-1) selectedID = 0;

        // Check if worker is still connected before sending
        const worker = cluster.workers[workers[selectedID]];
        if (worker && !worker.isDead()) {
            try {
                worker.send(JSON.stringify({
                    id,
                    type,
                    arg
                }));
            } catch (err) {
                // Worker has disconnected, ignore EPIPE errors
                if (err.code !== 'EPIPE') {
                    console.error('Master send error:', err);
                }
            }
        }

        lastID = selectedID;
    }

    var queue = {};
    ipc.on("systeminformation-call", (e, type, id, ...args) => {
        if (!si[type]) {
            signale.warn("Illegal request for systeminformation");
            return;
        }

        if (args.length > 1 || workers.length <= 0) {
            si[type](...args).then(res => {
                try {
                    if (e.sender && !e.sender.isDestroyed()) {
                        e.sender.send("systeminformation-reply-"+id, res);
                    }
                } catch(err) {
                    // Frame was disposed, ignore silently
                }
            });
        } else {
            queue[id] = e.sender;
            dispatch(type, id, args[0]);
        }
    });

    cluster.on("message", (worker, msg) => {
        msg = JSON.parse(msg);
        try {
            if (queue[msg.id] && !queue[msg.id].isDestroyed()) {
                queue[msg.id].send("systeminformation-reply-"+msg.id, msg.res);
                delete queue[msg.id];
            }
        } catch(e) {
            // Window has been closed or frame was disposed, ignore silently.
            delete queue[msg.id];
        }
    });
} else if (cluster.isWorker) {
    const signale = require("signale");
    const si = require("systeminformation");

    signale.info("Multithread worker started at "+process.pid);

    process.on("message", msg => {
        msg = JSON.parse(msg);
        si[msg.type](msg.arg).then(res => {
            // Check if parent process is still available before sending
            if (process.connected) {
                try {
                    process.send(JSON.stringify({
                        id: msg.id,
                        res
                    }));
                } catch (err) {
                    // Parent process has disconnected, ignore EPIPE errors
                    if (err.code !== 'EPIPE') {
                        console.error('Worker send error:', err);
                    }
                }
            }
        }).catch(err => {
            // Handle si call errors gracefully
            console.warn('Systeminformation call failed:', err.message);
        });
    });

    // Handle graceful shutdown
    process.on('disconnect', () => {
        // Parent process is shutting down, stop accepting new work
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        // Graceful termination
        process.exit(0);
    });

    process.on('SIGINT', () => {
        // Handle Ctrl+C gracefully
        process.exit(0);
    });
}
