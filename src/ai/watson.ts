import * as watson from 'watson-developer-cloud';
import { BotBase } from './botbuilder';
import * as restify from 'restify';

class WatsonBase extends BotBase {

    conversations;
    context: object = {}

    watsonPersonality;
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

            // this.controller.hears('', ['direct_mention', 'direct_message'], (bot, message) => {
            //     if (message.text.includes('<')) {
            //         console.log(message.text);
            //         var user = message.text.substring(message.text.lastIndexOf("<"), message.text.lastIndexOf(">") + 1);
            //         console.log(user);
            //         this.miboPlanRequest(bot, message, user);
            //     } else {
            //         this.watsonMessage(message.text.toString().trim()).then((res) => {
            //             if (typeof res !== 'undefined') {
            //                 if (this.intent == 'perform_insight') {
            //                     this.insightInit(bot, message);
            //                 } else {
            //                     console.log(this.context);
            //                     bot.reply(message, res);
            //                 }
            //             } else {
            //                 bot.reply(message, 'Could not get response from Watson.');
            //             }
            //         }).catch((err) => {
            //             bot.reply(message, 'Could not get response from Watson.');
            //             reject(err);
            //         })
            //     }
            // })
            resolve();

        })
    }

    personalityInsight() {
        return new Promise((resolve, reject) => {

            var personality_insights = watson.personality_insights({
                username: process.env.watson_username,
                password: process.env.watson_password,
                version: 'v2'
            });

            this.watsonPersonality = personality_insights;

            resolve();
        })

    }

    miboPlanRequest(bot, message, user) {
        var self = this;
        bot.startConversation(message, function (task, convo) {
            convo.ask('Hello ' + user + '! This is the first time i have seen you around! Can i interest you on MiBo?', [
                {
                    callback: function (response, convo) {
                        console.log('YES'); convo.say('Great, a new beginning! So would you like the plans first or the consultancies?');
                        convo.next();
                    },
                    pattern: bot.utterances.yes,
                },
                {
                    callback: function (response, convo) { console.log('NO'); convo.say("Alright, but you're missing out!"); convo.next(); },
                    pattern: bot.utterances.no,
                },
                {
                    default: true,
                    callback: function (response, convo) { console.log('DEFAULT'); convo.say('Huh?'); convo.repeat(); convo.next(); }
                }
            ])
        })
    }

    insightInit(bot, message) {
        var self = this;
        bot.reply(message, 'In the channels, I can only help you with the Channel Personality Insight. If you would like to learn about MiBo and get consultancy, please direct message me!');

        bot.startConversation(message, function (task, convo) {
            convo.ask('Would you like to learn about Personality Insights?', [
                {
                    callback: function (response, convo) {
                        console.log('YES'); convo.say('Awesome. Personality Insights is an API that divides personalities into five different characteristics.');
                        self.performInsight(bot, message);
                        convo.next();
                    },
                    pattern: bot.utterances.yes,
                },
                {
                    callback: function (response, convo) { console.log('NO'); convo.say("Alright, but you're missing out!"); convo.next(); },
                    pattern: bot.utterances.no,
                },
                {
                    default: true,
                    callback: function (response, convo) { console.log('DEFAULT'); convo.say('Huh?'); convo.repeat(); convo.next(); }
                }
            ])
        })
    }

    performInsight(bot, message) {
        var self = this;
        bot.api.channels.history({

            channel: message.channel,
        }, function (err, history) {
            //count: 500,

            if (err) {
                console.log('ERROR', err);
            }

            var messages = [];
            for (var i = 0; i < history.messages.length; i++) {
                messages.push(history.messages[i].text);
            }

            // call the watson api with your text
            var corpus = messages.join("\n");

            self.watsonPersonality.profile(
                {
                    text: corpus,
                    language: 'en'
                },
                function (err, response) {
                    if (err) {
                        console.log('error:', err);
                    } else {

                        bot.startConversation(message, function (task, convo) {

                            // response.tree.children.children is a list of the top 5 traits
                            var top5 = response.tree.children[0].children[0].children;
                            console.log(top5);
                            for (var c = 0; c < top5.length; c++) {

                                convo.say('This channel has ' + Math.round(top5[c].percentage * 100) + '% ' + top5[c].name);

                            }
                            bot.reply(message, 'You can learn more about Personality Insights using Node here: https://github.com/watson-developer-cloud/personality-insights-nodejs');
                        });
                    }
                }
            );
        });
    }

    init(server: restify.Server) {
        return new Promise((resolve, reject) => {
            this.loadBot(server).then(() => {
                console.log('Bot initialized...');
                this.loadConversations().then(() => {
                    this.watsonInteraction().then(() => {
                        this.personalityInsight().then(() => {
                            console.log('Watson initialized...')
                            resolve();
                        })
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