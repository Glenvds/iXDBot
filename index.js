const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();
const MusicBot = require('./music/music_bot');
const musicBot = new MusicBot();
const NSFWBot = require('./nsfw/nsfw_bot');
const nsfwBot = new NSFWBot();


//STATUS OF BOT LOGGING
client.once("ready", () => { console.log("IXDBot started."); });
client.once("reconnecting", () => { console.log("Reconnecting!"); });
client.once("disconnect", () => { console.log("Disconnect!"); });

//COMMANDS
const NSFW_COMMANDS = ["boobs", "ass", "hentai", "penis"];
const MUSIC_COMMANDS = ["play", "skip", "next", "stop"];

//DATA IXD SERVER
const musicChannelId = "312940674133655552";

client.on("message", async message => {
  if (!message.author.bot && message.content.startsWith(prefix)) {
    const args = message.content.split(" ");
    const command = args[0].split(prefix)[1];

    if (MUSIC_COMMANDS.includes(command)) {
      if (message.channel.id !== musicChannelId) { message.channel.send("This isn't the music channel!"); }
      else {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) { message.channel.send("You need to be in a voice channel to execute music commands!"); }
        else { musicBot.executeMusicCommand(command, message); }
      }
    }
    else if (NSFW_COMMANDS.includes(command)) {
      if (!message.channel.nsfw) { message.channel.send("This isn't the NSFW channel"); }
      else { nsfwBot.executeNSFWCommand(command, message); }
    }
    else { message.channel.send("Oops! I don't know that command.") }
  }
});

client.login(token);