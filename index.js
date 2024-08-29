const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');
const readline = require('readline');

let temp = parseInt(0);
let startTime;

class MCBot {
    constructor(username, host, port, owner, password, entityId) {
        this.username = username;
        this.host = host;
        this.port = port;
        this.owner = owner;
        this.password = password;
        this.entityId = entityId;
        this.initBot();
    }

    initBot() {
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "version": "1.20.4",
            "logErrors": false, // Optional: Disable error logging to console
        });

        this.bot.loadPlugin(pathfinder); // Load the pathfinder plugin
        this.bot.mcData = minecraftData(this.bot.version);
        this.movements = new Movements(this.bot, this.bot.mcData);

        this.initEvents();
    }

    initEvents() {
        this.bot.on('login', async () => {
            startTime = new Date(); // Record the start time when the bot logs in
            this.updateTerminalTitle(); // Update the terminal title
            
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
                const position = { x: 0.5, y: 65.0, z: -10.0 };
                const goal = new goals.GoalBlock(position.x, position.y, position.z);
                await this.bot.waitForTicks(20);
                console.log(`[${this.username}] Walk to Warp to Survival...`);
                this.bot.pathfinder.setMovements(this.movements); // Set movements
                this.bot.pathfinder.setGoal(goal);
                this.bot.look(1, 0, true);
                await this.bot.waitForTicks(120);
                console.log(this.bot.nearestEntity());

                // Interact with the specified entity
                const entity = this.bot.entities[this.entityId];
                if (entity) {
                    this.bot.activateEntity(entity);
                    this.bot.simpleClick.rightMouse(0);
                    console.log(`[${this.username}] Interacted with entity ${this.entityId}.`);
                } else {
                    console.log(`[${this.username}] Entity with ID ${this.entityId} not found.`);
                }

                // Change temp to 1
                temp = parseInt(1);
            } else if (temp === 1) {
                console.log(`[${this.username}] On Survival Server...`);
            }
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
            if (message.includes('tpame')) {
                console.log(`[${this.username}] Execute Teleport request to ${this.owner}...`);
                this.sendServerChat('/msg ' + this.owner + ' teleport to me');
                this.sendServerChat('/tpa ' + this.owner);
            }
            if (message.includes('tpme')) {
                console.log(`[${this.username}] Execute Teleport request to ${this.owner}...`);
                this.sendServerChat('/msg ' + this.owner + ' teleport to me');
                this.sendServerChat('/tp ' + this.owner);
            }
            if (message.includes('afkpls')) {
                console.log(`[${this.username}] Execute Teleport request to ${this.owner}...`);
                console.log(`[${this.username}] Execute AFK request...`);
                this.sendServerChat('/sit');
                this.sendServerChat('/afk');
            }
            if (message.includes('homepls')) {
                console.log(`[${this.username}] Execute Home request...`);
                this.sendServerChat('/home' + message.replace('homepls', ''));
            }
            if (message.includes('disconnect')) {
                console.log(`[${this.username}] Disconnecting...`);
                this.bot.end('disconnect.quitting');
                this.reconnect();
            }
        });

        this.bot.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                console.log(`[${this.username}] Failed to connect to ${err.address}:${err.port}`);
            } else {
                console.log(`[${this.username}] Unhandled error: ${err}`);
            }
        });

        setInterval(this.updateTerminalTitle.bind(this), 1000); // Update the title every second
        this.initCommandLine(); // Initialize real-time command input
    }

    updateTerminalTitle() {
        const elapsedTime = this.getElapsedTime();
        process.stdout.write(
            `\x1b]0;${this.username}@${this.host} | Online: ${elapsedTime}\x07`
        );
    }

    getElapsedTime() {
        const currentTime = new Date();
        const diffMs = currentTime - startTime;
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return `${diffHrs}h ${diffMins}m ${diffSecs}s`;
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
            "version": "1.20.4",
        });
        this.initEvents();
    }

    initCommandLine() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            if (input.startsWith('/')) {
                this.sendServerChat(input); // Send the command to the server
            } else {
                this.bot.chat(input); // Send the input as a chat message
            }
        });
    }
}

// Start the bot with command-line arguments
function startBot() {
    const args = process.argv.slice(2);

    if (args.length < 4) {
        console.log("Usage: node index.js <player_name> <password> <owner> <interact_entity>");
        process.exit(1);
    }

    const [username, password, owner, entityId] = args;

    const bot = new MCBot(username, "play.lastmine.net", 25565, owner, password, entityId);
}

startBot();