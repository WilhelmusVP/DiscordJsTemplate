const Discord = require('discord.js');

function capitalize(string) {
	return string[0].toUpperCase() + string.slice(1);
}

module.exports = {
	name: 'help',
	aliases: ['commands'],
	args: false,
	description: 'help',
	cooldown: 5,
	execute(bot, message, args) {
		const embed = new Discord.RichEmbed()
			.setTitle('***Command list***');

		const commands = bot.commands.array();
		commands.forEach((command, index) => {
			let commandInfo = `**Aliases**: ${command.aliases.join(', ')}\n`;
			commandInfo += `**Description**: ${command.description}\n`;
			if(command.args)
				commandInfo += `**Usage**: ${process.env.BOT_PREFIX}${command.name} ${command.usage}\n`;

			if(command.cooldown)
				commandInfo += `**Cooldown**: ${command.cooldown} second(s)`;


			embed.addField(capitalize(command.name), commandInfo);
			if(index + 1 < commands.length)
				embed.addBlankField();

		});

		message.channel.send(embed);
	},
};