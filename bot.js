if(process.env.NODE_ENV !== 'production')
	require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();
const winston = require('winston');
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'bot.log' }),
	],
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		winston.format.printf(log => `[${log.timestamp} ${log.level.toUpperCase()}] - ${log.message}`)
	),
});

const cooldowns = new Discord.Collection();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

bot.on('ready', () => {
	logger.info('Bot loaded!');
	bot.user.setActivity(`${process.env.BOT_PREFIX}`)
		.catch(ex => logger.error(ex));
});

bot.on('message', message => {
	if(!message.content.startsWith(process.env.BOT_PREFIX) || message.author.bot || message.channel.type === 'dm') return;

	const args = message.content.slice(process.env.BOT_PREFIX.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if(!command) {
		const reply = `Cannot find command '${commandName}'. Use ${process.env.BOT_PREFIX}help for a list of usable commands.`;
		return message.channel.send(reply)
			.then(r => r.delete(5000))
			.catch(ex => logger.error(ex));

	}

	if(command.args && !args.length) {
		const reply = `This command requires arguments: ${process.env.BOT_PREFIX}${command.name} ${command.usage}`;
		return message.channel.send(reply);
	}

	if(!cooldowns.has(command.name))
		cooldowns.set(command.name, new Discord.Collection());


	if(command.cooldown) {
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown) * 1000;

		if(timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if(now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`You have to wait ${timeLeft.toFixed(1)} more second(s) before you can use this command again.`);
			}else{
				timestamps.delete(message.author.id);
			}
		}else{
			timestamps.set(message.author.id, now);
		}
	}

	try {
		command.execute(bot, message, args);
	} catch (er) {
		message.reply('Error trying to execute that command...')
			.then(r => r.delete(5000))
			.catch(ex => logger.error(ex));
	}
});

bot.on('error', er => {
	logger.error(er);
});

bot.login(process.env.BOT_TOKEN);
