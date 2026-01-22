const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const play = require("play-dl");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = createAudioPlayer();

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ▶️ PLAY
  if (command === "play") {
    if (!message.member.voice.channel)
      return message.reply("❌ پێویستە لە ڤۆیس چەنەڵ بێیت");

    if (!args[0])
      return message.reply("❌ لینکێک بنووسە");

    try {
      const stream = await play.stream(args[0]);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      connection.subscribe(player);
      player.play(resource);

      message.reply("🎶 میوزیک دەستپێکرد");
    } catch (err) {
      message.reply("❌ هەڵەیەک ڕوویدا");
      console.log(err);
    }
  }

  // ⏹ STOP
  if (command === "stop") {
    player.stop();
    message.reply("⏹ میوزیک وەستا");
  }
});

client.login(process.env.DISCORD_TOKEN);
