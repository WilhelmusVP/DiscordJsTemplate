module.exports = {
	name: 'example',
	aliases: ['e', 'ex'],
	args: true,
	usage: '<word>',
	description: 'example command',
	cooldown: 5,
	execute(bot, message, args) {
		message.channel.send(`example command, ${args[0]}`);
	},
};