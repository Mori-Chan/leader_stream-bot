const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stream')
		.setDescription('VCを中継。')
	,
	async execute(interaction, clients) {

		let connections = [];
		let voiceChannels = [];
		let len = clients.length;

		for (let i = 0; i < len; i++) {
			if (eval(`process.env.BOT${ i + 1 }_VC_ID`)){
				voiceChannels[i] = eval(`process.env.BOT${ i + 1 }_VC_ID`);
			}
			else {
				break;
			}
		}

		const mixer = new AudioMixer.Mixer({
			channels: 2,
			bitDepth: 16,
			sampleRate: 48000,
			clearInterval: 250,
		});

		for (let i = 0; i < len; i++) {
			connections[i] = joinVoiceChannel({
				group: `BOT ${ i }`,
				guildId: interaction.guildId,
				channelId: voiceChannels[i],
				adapterCreator: clients[i].guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				selfMute: false,
				selfDeaf: false,
			});
			connections[i].receiver.speaking.on('start', (userId) => {
				let member = interaction.guild.members.cache.get(userId);
				console.log(member);
				if (member.roles.cache.has(process.env.LEADER)) {
					const standaloneInput = new AudioMixer.Input({
						channels: 2,
						bitDepth: 16,
						sampleRate: 48000,
						volume: 100,
					});
					const audioMixer = mixer;
					audioMixer.addInput(standaloneInput);
					const audio = connections[i].receiver.subscribe(userId, {
						end: {
							behavior: EndBehaviorType.AfterSilence,
							duration: 100,
						},
					});
					const rawStream = new PassThrough();
					audio
						.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
						.pipe(rawStream);
					const p = rawStream.pipe(standaloneInput);
					const player = createAudioPlayer({
						behaviors: {
							noSubscriber: NoSubscriberBehavior.play,
						},
					});
					const resource = createAudioResource(mixer,
						{
							inputType: StreamType.Raw,
						},
					);
					player.play(resource);
					connections[1].subscribe(player);
					rawStream.on('end', () => {
						if (this.audioMixer != null) {
							this.audioMixer.removeInput(standaloneInput);
							standaloneInput.destroy();
							rawStream.destroy();
							p.destroy();
						}
					});
				}
				else {
					return;
				}
			});
		}
		await interaction.reply('VCを中継します！');
		return [connections];
	},
};