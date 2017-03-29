import { WatsonBase } from './watson';
import * as restify from 'restify';
import * as botbuilder from 'botbuilder';


class BasicInteraction extends WatsonBase {

    basicChat() {
        return new Promise((resolve, reject) => {
            this.bot.dialog('/', [(session) => {
                this.basicIntents(session.message.text, session).then(() => {
                    session.send('Anything else I can help you with? Aske me more!');
                }).catch((err) => {
                    reject(err);
                })
            }, (session, result: botbuilder.IPromptChoiceResult) => {
                if (!result.response) {
                    session.endDialog('I do not think you have chosen a valid option, did you?');
                }
                var userChoice = result.response.entity;
                this.basicIntents(userChoice, session).then(() => {
                    session.send('Anything else I can help you with? Ask me more!');
                }).catch((err) => {
                    reject(err);
                })
            }])
            resolve();

        })
    }

    init(server: restify.Server) {
        return new Promise((resolve, reject) => {
            this.loadBot(server).then(() => {
                console.log('Bot initialized...');
                this.loadConversations().then(() => {
                    this.basicChat().then(() => {
                        console.log('Watson Basic Chats initialized...')
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

export default new BasicInteraction();