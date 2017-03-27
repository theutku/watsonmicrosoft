import * as botbuilder from 'botbuilder';
import * as restify from 'restify';

export class BotBase {

    bot: botbuilder.UniversalBot;

    loadBot(server: restify.Server) {
        return new Promise((resolve, reject) => {

            var connector = new botbuilder.ChatConnector({
                appId: process.env.microsoft_appId,
                appPassword: process.env.microsoft_appPass
            });

            this.bot = new botbuilder.UniversalBot(connector);
            server.post('/api/messages', connector.listen());
            resolve();
        })
    }

    constructor() {

    }

}

export default new BotBase();