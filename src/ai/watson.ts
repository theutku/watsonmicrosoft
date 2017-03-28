import * as watson from 'watson-developer-cloud';
import { BotBase } from './botbuilder';
import * as restify from 'restify';
import * as botbuilder from 'botbuilder';

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
                        switch (this.intent) {
                            case 'services':
                                session.send(res);
                                this.createAllServicesCards(session);
                                break;
                            case 'machine_learning':
                                this.createThumbnailCard(session, 'Machine Learning', 'http://bigdata-madesimple.com/wp-content/uploads/2016/04/Artificial-Intelligence.jpg', 'http://aibrite.com/', 'Artificial Intelligence and Machine Learning Implementations', null, 'Discover')
                                session.send(res);
                                break;
                            case 'data_visualisation':
                                this.createThumbnailCard(session, 'Smart Data Visualisation', 'https://cdn.outsource2india.com/webanalytics/images/data-visualization-sample.jpg', 'http://aibrite.com/', 'Visualize Your Data In Seconds', null, 'Find Out More')
                                session.send(res);
                                break;
                            case 'jdash':
                                this.createThumbnailCard(session, 'Aibrite Dashboards', 'http://aibrite.com/wp-content/uploads/2015/12/jdash-dashboard-drag-drop-finger.png', 'http://jdash.io/', 'JDash Dashboard Framework', null, 'See in Action')
                                session.send(res);
                                break;
                            case 'aibrite':
                                this.createThumbnailCard(session, 'Aibrite', 'http://aibrite.com/wp-content/uploads/2017/03/cropped-cropped-logo-1-e1490694687582.png', 'http://aibrite.com/', 'MACHINE INTELLIGENCE AND SMART DATA VISUALIZATIONS', 'As being a machine intelligence & data visualization company we can add artificial intelligence to your existing applications. We can analyse your data and automatically generate smart data visualizations. You can also use our dashboard framework Jdash to add drag-drop dashboards into your applications.', 'Homepage')
                                session.send(res);
                                break;
                            default:
                                session.send(res);
                        }
                    } else {
                        session.send('Could not get response from Watson.');
                        reject();
                    }

                }).catch((err) => {
                    session.send('Error: Cannot connect to Watson');
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