import * as restify from 'restify';
import * as botbuilder from 'botbuilder';
import * as path from 'path';
import * as fs from 'fs';

import BotBase from './ai/botbuilder';
import BasicInteractions from './ai/basicinteraction';

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
                fs.readFile('./public/chat.html', 'utf8', (err, file) => {
                    if (err) {
                        console.log(err);
                        res.send(500);
                        return next();
                    }

                    res.write(file);
                    res.end();
                    return next();
                });
            })

            // this.server.get('/api/messages', (req: restify.Request, res: restify.Response, next: restify.Next) => {
            //     var body = "<html><head><script src='https://code.jquery.com/jquery-3.2.1.min.js' integrity='sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=' crossorigin = 'anonymous' > </script><script src='../public/scripts/weather.js'></script></head> <body><iframe style='height:480px; width:100%;' src= 'https://webchat.botframework.com/embed/aibrite?s=" + process.env.microsoft_secret + "' > </iframe></body> </html>";
            //     res.writeHead(200, {
            //         'Content-Length': Buffer.byteLength(body),
            //         'Content-Type': 'text/html'
            //     });
            //     res.write(body);
            //     res.end();
            // })

            this.server.post('/weather', (req: restify.Request, res: restify.Response, next: restify.Next) => {
                var data = req.body.data;
                var err = req.body.err;
                if (err) {
                    console.log('Weather Error: ', err);
                } else {
                    BotBase.saveWeather(data);
                    console.log(data);
                    res.send(200);
                }

            })
            resolve();
        })

    }

    init() {
        return new Promise((resolve, reject) => {
            this.server = restify.createServer();
            this.server.use(restify.urlEncodedBodyParser({ mapParams: false }));
            this.server.listen(process.env.PORT, (err: Error) => {
                if (err) {
                    console.log(err);
                    process.exit(2);
                }
                console.log('Bot App started listening at port: ', this.server.url, ' ...');
                this.loadRoutes().then(() => {
                    console.log('Test Routes loaded...');
                    BasicInteractions.init(this.server).then(() => {
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