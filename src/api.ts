import * as restify from 'restify';
import * as botbuilder from 'botbuilder';

import BotBase from './ai/botbuilder';
import WatsonBase from './ai/watson';

class WatsonBotApp {

    private server: restify.Server;

    loadRoutes() {
        return new Promise((resolve, reject) => {
            this.server.get('/', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                res.send(200, 'App is working');
            })

            this.server.get('/status', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                res.send(200, 'App is OK!');
            })
            this.server.get('/api/messages', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                var body = "<html><head></head><body><iframe style='height:480px; width:402px' src='https://webchat.botframework.com/embed/aibrite?s=nDw65L-e3vM.cwA.BAs.72kXA9-9by8Z8vhkYr1SFWv54km16mi4lMUh1PEzAr0'></iframe></body></html>";
                res.writeHead(200, {
                    'Content-Length': Buffer.byteLength(body),
                    'Content-Type': 'text/html'
                });
                res.write(body);
                res.end();
            })
            resolve();
        })

    }

    init() {
        return new Promise((resolve, reject) => {
            this.server = restify.createServer();
            this.server.listen(process.env.PORT, (err: Error) => {
                if (err) {
                    console.log(err);
                    process.exit(2);
                }
                console.log('Bot App started listening at port: ', this.server.url, ' ...');
                this.loadRoutes().then(() => {
                    console.log('Test Routes loaded...');
                    WatsonBase.init(this.server).then(() => {
                        resolve();
                    }).catch((err) => {
                        process.exit(2);
                    })
                })

            })
        })

    }

    constructor() {

    }
}

export var App: WatsonBotApp;

export default () => (App = new WatsonBotApp());