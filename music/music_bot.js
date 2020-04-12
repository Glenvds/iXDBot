const ytdl = require("ytdl-core");
const ytsr = require('ytsr');



class MusicBot {
    constructor() {
        this.queue = new Map();
    }

    executeMusicCommand(command, message) {
        const serverQueue = this.queue.get(message.guild.id);
        switch (command) {
            case "play": this.getSong(message, serverQueue); break;
            case "skip":
                if (!serverQueue) {
                    this.sendMessageToChannel(message.channel, "There are no songs to skip!");
                }
                else { this.skip(serverQueue); } break;
            case "stop": this.stop(message, serverQueue); break;
        }
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
                this.play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                console.log(err);
                this.queue.delete(message.guild.id);
            }
        }
        else {
            serverQueue.songs.push(song);
            this.sendMessageToChannel(message.channel, `${song.title} has been added to the queue!`);
        }
    }

    play(guild, song) {
        const serverQueue = this.queue.get(guild.id);
        if (!song) {
            this.sendMessageToChannel(serverQueue.textChannel, "Ran out of song, I'm leaving. Soai.")
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            return;
        }

        this.sendMessageToChannel(serverQueue.textChannel, "Started playing: " + song.title)

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
    }

    skip(serverQueue) {
        //this.sendMessageToChannel(serverQueue.textChannel, "Skipping current song");
        //console.log("SERVER QUEUE: " + JSON.stringify(serverQueue));
        serverQueue.connection.dispatcher.end();
    }

    stop(serverQueue) {
        this.sendMessageToChannel(serverQueue.textChannel, "Deleted my queue, I'm out.")
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

    sendMessageToChannel(channel, msg) {
        channel.send(msg);
    }
}


module.exports = MusicBot;
