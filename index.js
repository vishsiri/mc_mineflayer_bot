const mineflayer = require('mineflayer');
const readline = require('readline');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
let rl = readline.createInterface(process.stdin, process.stdout);
let temp = parseInt(0);
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
            "logErrors": false, // Optional: Disable error logging to console
        });

        this.bot.loadPlugin(pathfinder); // Load the pathfinder plugin
        this.movements = new Movements(this.bot, this.bot.mcData);

        this.initEvents();
    }

    initEvents() {
        this.bot.on('login', async () => {
            if (temp === 0) {
                console.log(`[${this.username}] On Server..`);
                await this.bot.waitForTicks(20);
                console.log(`[${this.username}] Registering...`);
                this.sendServerChat('/register ' + this.password + ' ' + this.password);
                await this.bot.waitForTicks(20);
                console.log(`[${this.username}] Login...`);
                this.sendServerChat('/login ' + this.password);
                await this.bot.waitForTicks(20);
                console.log(`[${this.username}] Walk to Warp to Survival...`);
                // const position = { x: -130.5, y: 127, z: -27.5 };
                const x = parseFloat(1);
                const y = parseFloat(82);
                const z = parseFloat(-475);
                const position = { x, y, z };
                const goal = new goals.GoalBlock(position.x, position.y, position.z);
                await this.bot.waitForTicks(20);
                console.log(`[${this.username}] Walk to Warp to Survival...`);
                this.bot.pathfinder.setGoal(goal);
                this.bot.look(1,0,true)
                await this.bot.waitForTicks(120);
                console.log(`[${this.username}] Done...`);

                //change temp to 1
                temp = parseInt(1);
            }
            else if (temp === 1) {
                console.log(`[${this.username}] On Survival Server...`);
            }
        });
            //stop event
            // this.bot.activateEntityAt();
            // console.log(`[${this.username}] Warp to Survival...`);
            // this.sendServerChat('/cmi server survival -f');

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
            if (message.includes('afkpls')) {
                console.log(`[${this.username}] Execute Teleport request to ${this.owner}...`);
                console.log(`[${this.username}] Execute AFK request...`);
                this.sendServerChat('/sit');
                this.sendServerChat('/afk');
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
                const bot = new MCBot(username, "fluffyworld.online", 25565, owner, password);
                rl.close();
            });
        });
    });
}

startBot();
