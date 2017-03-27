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
            server.get('/api/messages', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                var body = "<html><head></head><body><iframe style='height:480px; width:402px' src='https://webchat.botframework.com/embed/aibrite?s=nDw65L-e3vM.cwA.BAs.72kXA9-9by8Z8vhkYr1SFWv54km16mi4lMUh1PEzAr0'></iframe></body></html>";
                res.writeHead(200, {
                    'Content-Length': Buffer.byteLength(body),
                    'Content-Type': 'text/html'
                });
                res.write(body);
                res.end();
            })
            this.bot = new botbuilder.UniversalBot(connector);
            server.post('/api/messages', connector.listen());
            resolve();
        })
    }

    constructor() {

    }

}

export default new BotBase();