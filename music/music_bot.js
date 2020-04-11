const ytdl = require("ytdl-core");
const ytsr = require('ytsr');



class MusicBot {
    constructor() {
        this.queue = new Map();
    }

    executeMusicCommand(command, message) {
        const serverQueue = this.queue.get(message.guild.id);
        if(this.check(message, "You need to be in a voice channel to play music!")){
            switch (command) {
                case "play": this.getSong(message, serverQueue); break;
                case "skip": this.skip(message, serverQueue); break;
                case "stop": this.stop(message, serverQueue); break;
            }
        }        
    }

    check(message, errorMessage) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) { this.sendMessage(message, errorMessage); return false; }
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            this.sendMessage(message, "I need the permissions to join and speak in your voice channel!");
            return false;
        }
        return true;
    }

    async getSong(message, serverQueue) {
        const voiceChannel = message.member.voice.channel;
        const content = message.content;
        const data = content.substring(content.indexOf(' ') + 1);
        let request = "";

        if (!this.isURL(data)) {
            const result = await this.searchYoutube(data);
            request = result.items[0].link;
        } else {
            request = data;
        }

        const songInfo = await ytdl.getInfo(request);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            this.queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                this.play(message.guild, queueContruct.songs[0], message);
            } catch (err) {
                console.log(err);
                this.queue.delete(message.guild.id);
            }
        }
        else {
            serverQueue.songs.push(song);
            this.sendMessage(message, `${song.title} has been added to the queue!`);
        }

    }

    play(guild, song, message) {
        const serverQueue = this.queue.get(guild.id);
        if (!song) {
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection.play(ytdl(song.url))
            .on("finish", () => {
                console.log(song.title + " ended playing");
                serverQueue.songs.shift();
                this.play(guild, serverQueue.songs[0]);
            })
            .on("error", error => {
                console.log(error);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

        return `Start playing: **${song.title}**`;
    }

    skip(message, serverQueue) {
        this.check(message, "You have to be in a voice channel to stop the music!");
        if (!serverQueue) { this.sendMessage(message, "There is no song that I could skip!"); }
        serverQueue.connection.dispatcher.end();
    }

    stop(message, serverQueue) {
        this.check(message, "You have to be in a voice channel to stop the music!");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }

    async searchYoutube(searchString) {
        const options = { limit: 1 };
        const result = await ytsr(searchString, options);
        return result;
    }

    isURL(s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
    }

    testURL = async (url) => (await fetch(url)).status === 200;

    sendMessage(messageObj, string) {
        messageObj.channel.send(string);
    }
}


module.exports = MusicBot;
