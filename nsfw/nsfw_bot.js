const fetch = require('node-fetch');

///Data
const NSFW_BASEURLS = {
    boobs: [{ link: "http://media.oboobs.ru/boobs/", maxCount: 14678, extension: ".jpg", needsPaddingZeroes: 5 }],
    ass: [{ link: "http://media.obutts.ru/butts/", maxCount: 7417, extension: ".jpg", needsPaddingZeroes: 5 }],
    hentai: [{ link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/02/8b/a4/028ba4c4d9b039efffa26a6daec2ca06/", maxCount: 19, extension: ".jpg", needsPaddingZeroes: false },
    { link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/01/e1/6b/01e16b325d1622d557c197f1dca3aefc/", maxCount: 19, extension: ".jpg", needsPaddingZeroes: false },
    { link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/ee/1f/93/ee1f93b2562d56ac3a681ce4b3abb7b2/", maxCount: 14, extension: ".jpg", needsPaddingZeroes: false },
    { link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/f4/f2/ff/f4f2ff1ace17d02bfaab856948a6c7aa/", maxCount: 11, extension: ".jpg", needsPaddingZeroes: false }]
};


class NSFWBot {
    constructor() {

    }

    executeNSFWCommand(command, message) {
        switch (command) {
            case "penis":  this.sendMessage(message, "Jordy is gay."); break;
            default: this.genNSFWUrl(command, message);
        }
    }

    async genNSFWUrl(command, message) {
        const baseObj = NSFW_BASEURLS[command][Math.floor(Math.random() * NSFW_BASEURLS[command].length)];
        let NSFWUrl = baseObj.link + this.genNum(baseObj) + baseObj.extension;

        if (await this.testURL(NSFWUrl)) { this.sendMessage(message, NSFWUrl); }
        else {
            do { NSFWUrl = baseObj.link + this.genNum(baseObj) + baseObj.extension; }
            while (!(await this.testURL(NSFWurl)))
            this.sendMessage(message, NSFWUrl);
        }
    }

    genNum = (baseObj) => {
        let rand = Math.floor(Math.random() * baseObj.maxCount) + 1;
        return !baseObj.needsPaddingZeroes ? rand : rand.toString().padStart(baseObj.needsPaddingZeroes, '0');
    };

    testURL = async (url) => (await fetch(url)).status === 200;

    sendMessage(messageObj, string) {
        messageObj.channel.send("`" +  string + "`");
    }
}

module.exports = NSFWBot;