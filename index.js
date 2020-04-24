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
const MUSIC_COMMANDS = ["play", "skip", "next", "stop", "queue"];

//DATA IXD SERVER
const musicChannelId = "312940674133655552";

function sendResponse(channel, text) {
  channel.send("`" + text + "`");
};

client.on("message", async message => {
  if (!message.author.bot && message.content.startsWith(prefix)) {
    const args = message.content.split(" ");
    const command = args[0].split(prefix)[1];
    const channel = message.channel;
    
    if (MUSIC_COMMANDS.includes(command)) {
      if (channel.id !== musicChannelId) { sendResponse(channel, "This isn't the music channel!"); }
      else {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) { sendResponse(channel, "You need to be in a voice channel to execute music commands!"); }
        else { musicBot.executeMusicCommand(command, message); }
      }
    }
    else if (NSFW_COMMANDS.includes(command)) {
      if (!channel.nsfw) { sendResponse(channel, "This isn't the NSFW channel"); }
      else { nsfwBot.executeNSFWCommand(command, message); }
    }
    else { sendResponse(channel, "Oops! I don't know that command."); }
  }
});

client.login(token);