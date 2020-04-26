const ytdl = require("ytdl-core-discord");
const ytsr = require('ytsr');
//const radio = require('radio-stream');
var icecast = require('icecast');

const radioStations = [{name: "Studio Brussel", url: "http://icecast.vrtcdn.be/stubru-high.mp3"}, {name: "MNM", url:"http://icecast.vrtcdn.be/mnm-high.mp3"}, {name: "Radio 1", url:"http://icecast.vrtcdn.be/radio1-high.mp3"},
 {name: "Klara", url:"http://icecast.vrtcdn.be/klara-high.mp3"}, {name: "TOPRadio", url:"http://stream4.topradio.be/topradio.mp3"}];

class MusicBot {
    constructor() {
        this.queue = new Map();
        this.isRadioPlaying = false;
        this.isMusicPlaying = false;
    }

    executeMusicCommand(command, message) {
        const serverQueue = this.queue.get(message.guild.id);        
        switch (command) {
            case "play": this.getSong(message, serverQueue); break;
            case "skip": this.skip(serverQueue); break;
            case "next": this.skip(serverQueue); break;
            case "stop": this.stop(message, serverQueue); break;
            case "queue": this.getQueue(serverQueue); break;
            case "radio": this.playRadio(message); break;
        }
    }



    setupVoiceConnection(voiceChannel){
        try{
            let connection = voiceChannel.join();
            return connection;
        }
        catch(err){
            console.log("Error while setting up voice connection: " + err);
            this.queue.delete(message.guild.id);
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
            url: songInfo.video_url,
            requester: message.author.username
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
            queueContruct.connection = this.setupVoiceConnection(voiceChannel);
            this.play(message.guild, queueContruct.songs[0]);
        }
        else {
            serverQueue.songs.push(song);
            this.sendMessageToChannel(message.channel, `${song.title} has been added to the queue!`);
        }
    }

    async play(guild, song) {
        const serverQueue = this.queue.get(guild.id);
        this.isMusicPlaying = true;
        if (!song) {
            this.sendMessageToChannel(serverQueue.textChannel, "Ran out of song, I'm leaving. Soai.")
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            this.isMusicPlaying = false;
            return;
        }

        const dispatcher = serverQueue.connection.play(await ytdl(song.url), { type: 'opus', highWaterMark: 50 })
            .on("start", () => { this.sendMessageToChannel(serverQueue.textChannel, "Started playing: " + song.title) })
            .on("finish", () => {
                console.log(song.title + " ended playing");
                serverQueue.songs.shift();
                this.play(guild, serverQueue.songs[0]);
            })
            .on("debug", debug => {
                console.log("DEBUG: " + debug);
            })
            .on("error", error => {
                console.log(error);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }

    skip(serverQueue) {
        if (!serverQueue) {
            this.sendMessageToChannel(serverQueue.textChannel, "There are no songs to skip!");
        }
        else { serverQueue.connection.dispatcher.end(); }
    }

    stop(serverQueue) {
        
        this.sendMessageToChannel(serverQueue.textChannel, "Deleted my queue, I'm out.")
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        this.isMusicPlaying = false;
    }

    getQueue(serverQueue) {
        let text = "```--- Music queue ---\n\n";
        serverQueue.songs.forEach((song, index) => {
            if (index === 0) {
                text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester + "\n\n");
            } else {
                text = text.concat(index + ". " + song.title + " | Requested by: @" + song.requester + "\n");
            }
        });
        text = text.concat("```");
        serverQueue.textChannel.send(text);
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
        channel.send("`" + msg + "`");
    }

    async playRadio(message) {
        this.isRadioPlaying = true;
        const voiceChannel = message.member.voice.channel;
        const textChannel = message.channel;
        const url = "http://icecast.vrtcdn.be/radio1-high.mp3";




        const connection = await voiceChannel.join();
        const dispatcher = connection.play(url);
        /*icecast.get(url, (res) => {
            const dispatcher = connection.play(res);
        })*/
    }


    /*async playRadio(message){
        const voiceChannel = message.member.voice.channel;     
        const textChannel = message.channel;   
        const stream = radio.createReadStream("http://dir.xiph.org/listen/2855908/listen.m3u");

        
            const connection = await voiceChannel.join();
    

        
        stream.on("connect", () => {
            console.log("Radio stream connected!");
            console.log(stream.headers);
        });

        stream.on("data", (chunck) => {
            console.log(typeof chunck);
            console.log(chunck);
            const dispatcher = connection.play(chunck)
            .on("start", () => {this;this.sendMessageToChannel(textChannel, "Started playing radio");})
            .on("finish", () => {
                console.log("ended radio")
            })
            .on("debug", debug => {
                console.log("DEBUG: " + debug);
            })
            .on("error", error => {
                console.log(error);
            });
        })
    }*/




}


module.exports = MusicBot;
