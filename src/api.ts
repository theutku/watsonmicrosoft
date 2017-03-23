import * as restify from 'restify';
import * as botbuilder from 'botbuilder';

import BotBase from './ai/botbuilder';
import WatsonBase from './ai/watson';

class WatsonBotApp {

    private server: restify.Server;
    bot: botbuilder.UniversalBot;

    loadBot() {
        return new Promise((resolve, reject) => {

            var connector = new botbuilder.ChatConnector({
                appId: '',
                appPassword: ''
            });

            this.bot = new botbuilder.UniversalBot(connector);
            this.server.post('/api/messages', connector.listen());
            resolve();
        })

    }

    // testRoute() {
    //     return new Promise((resolve, reject) => {
    //         this.app.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //             res.status(200).send('App is working');
    //         })

    //         this.app.get('/status', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //             res.status(200).send('App is OK!');
    //         })
    //         resolve();
    //     })

    // }

    init() {
        return new Promise((resolve, reject) => {
            this.server = restify.createServer();
            this.server.listen(process.env.PORT, (err: Error) => {
                if (err) {
                    console.log(err);
                    process.exit(2);
                }
                console.log('Bot App started listening at port: ', this.server.url, ' ...');
                BotBase.loadBot(this.server).then(() => {
                    console.log('Bot initialized...');
                    WatsonBase.init().then(() => {
                        console.log('Watson initialized...');
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