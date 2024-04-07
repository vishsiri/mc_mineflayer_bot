const mineflayer = require('mineflayer');
const readline = require('readline');

let rl = readline.createInterface(process.stdin, process.stdout);

class MCBot {
    constructor(username, host, port, owner, password) {
        this.username = username;
        this.host = host;
        this.port = port;
        this.owner = owner;
        this.password = password;
        this.initBot();
    }

    initBot() {
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "version": "1.20.1",
        });

        this.initEvents();
    }

    initEvents() {
        this.bot.on('login', async () => {
            console.log(`[${this.username}] On Server..`);
            await this.bot.waitForTicks(20);
            console.log(`[${this.username}] Registering...`);
            this.sendServerChat('/register ' + this.password + ' ' + this.password);
            await this.bot.waitForTicks(20);
            console.log(`[${this.username}] Login...`);
            this.sendServerChat('/login ' + this.password);
            await this.bot.waitForTicks(20);
            console.log(`[${this.username}] Warp to Survival...`);
            this.sendServerChat('/cmi server survival -f');
        });

        this.bot.on('resourcePack', () => {
            console.log(`[${this.username}] AcceptResourcePack`);
            this.bot.acceptResourcePack();
        });

        this.bot.on('end', (reason) => {
            console.log(`[${this.username}] Disconnected: ${reason}`);

            if (reason === "socketClosed") {
                console.log(`[${this.username}] Reconnecting in 5 seconds...`);
                setTimeout(() => this.reconnect(), 5000);
            }
        });

        this.bot.on('chat', (username, message) => {
            console.log(`[${this.username}] ${username}: ${message}`);
        
            if (message.includes("register")) {
                    console.log(`[${this.username}] Registering...`);
                    this.sendServerChat(`/register ${this.password} ${this.password}`);
            }
            if (message.includes("login")) {
                    console.log(`[${this.username}] Login...`);
                    this.sendServerChat('/login ' + this.password);
            }
            if (message.includes('tpme')) {
                    console.log(`[${this.username}] Execute Teleport request to ${this.owner}...`);
                    this.sendServerChat('/msg ' + this.owner + ' teleport to me');
                    this.sendServerChat('/tpa ' + this.owner);
            }
            if (message.includes('disconnect')) {
                    console.log(`[${this.username}] Disconnecting...`);
                    this.bot.end('disconnect.quitting');
            }
        });

        this.bot.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                console.log(`[${this.username}] Failed to connect to ${err.address}:${err.port}`);
            } else {
                console.log(`[${this.username}] Unhandled error: ${err}`);
            }
        });
    }

    sendServerChat(message) {
        this.bot.chat(message);
    }

    reconnect() {
        console.log(`[${this.username}] Reconnecting...`);
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "version": "1.20.1",
        });
        this.initEvents();
    }
}

// Start only one bot
function startBot() {
    rl.question("Enter username: ", (username) => {
        rl.question("Enter password: ", (password) => {
            rl.question("Enter owner: ", (owner) => {
                const bot = new MCBot(username, "play.overblue.online", 25565, owner, password);
                rl.close();
            });
        });
    });
}

startBot();
