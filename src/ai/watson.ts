import * as watson from 'watson-developer-cloud';
import { BotBase } from './botbuilder';
import * as restify from 'restify';

class WatsonBase extends BotBase {

    conversations;
    context: object = {}

    private intent;

    loadConversations() {
        return new Promise((resolve, reject) => {
            var conversation = watson.conversation({
                username: process.env.conv_username,
                password: process.env.conv_password,
                version: 'v1',
                version_date: '2016-09-20'
            });
            this.conversations = conversation;
            resolve();
        })

    }

    watsonMessage(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.conversations.message({
                workspace_id: process.env.workspaceId,
                input: { 'text': message },
                context: this.context
            }, (err, response) => {
                if (err) {
                    console.log('Error: ', err);
                    reject(err);
                } else {
                    console.log('Watson: ' + response.output.text[0]);
                    console.log('User Intent: ', response.intents[0].intent);
                    this.intent = response.intents[0].intent;
                    this.context = response.context;
                    resolve(response.output.text[0]);
                }
            });
        })

    }

    watsonInteraction() {
        return new Promise((resolve, reject) => {

            this.bot.dialog('/', (session) => {
                this.watsonMessage(session.message.text).then((res) => {
                    if (res.length || typeof res !== 'undefined') {
                        session.send(res);
                    } else {
                        session.send('Could not get response from Watson.');
                        reject();
                    }

                }).catch((err) => {
                    session.send('Watson Error');
                    reject(err);
                })
            })
            resolve();

        })
    }

    init(server: restify.Server) {
        return new Promise((resolve, reject) => {
            this.loadBot(server).then(() => {
                console.log('Bot initialized...');
                this.loadConversations().then(() => {
                    this.watsonInteraction().then(() => {
                        console.log('Watson initialized...')
                        resolve();
                    }).catch((err) => {
                        console.log('Watson Message Error: ', err);
                        reject(err);
                    })
                })
            }).catch((err) => {
                console.log('Error: ', err);
                reject(err);
            })
        });
    }

    constructor() {
        super();
    }
}

export default new WatsonBase();