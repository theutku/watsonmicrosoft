import * as watson from 'watson-developer-cloud';
import * as botbuilder from 'botbuilder';
import { BotBase } from './botbuilder';
import * as restify from 'restify';
import { IJdashPlan, jdashPlans } from '../jdash/plans';

export class WatsonBase extends BotBase {

    conversations;
    context: object = {}

    intent;

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
            console.log(message);
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

    getUserEmailPrompt() {

    }

    basicIntents(message: string, session: botbuilder.Session) {
        return this.watsonMessage(message).then((res) => {
            if (res.length || typeof res !== 'undefined') {
                switch (this.intent) {
                    case 'greeting':
                        session.send(res);
                        var choices = ['Aibrite, Inc.', 'Aibrite Services', 'Machine Learning and AI', 'Smart Data Visualisation', 'JDash Dashboard Framework', 'JDash Subscriptions'];
                        return botbuilder.Prompts.choice(session, 'Which of the following would you like to learn more about?', choices);
                    // break;
                    case 'services':
                        session.send(res);
                        this.sendAllServicesCards(session);
                        break;
                    case 'machine_learning':
                        this.sendThumbnailCard(session, 'Machine Learning', 'http://bigdata-madesimple.com/wp-content/uploads/2016/04/Artificial-Intelligence.jpg', 'http://aibrite.com/', 'Artificial Intelligence and Machine Learning Implementations', null, 'Discover')
                        session.send(res);
                        break;
                    case 'data_visualisation':
                        this.sendThumbnailCard(session, 'Smart Data Visualisation', 'https://cdn.outsource2india.com/webanalytics/images/data-visualization-sample.jpg', 'http://aibrite.com/', 'Visualize Your Data In Seconds', null, 'Find Out More')
                        session.send(res);
                        break;
                    case 'jdash':
                        this.sendThumbnailCard(session, 'Aibrite Dashboards', 'http://aibrite.com/wp-content/uploads/2015/12/jdash-dashboard-drag-drop-finger.png', 'http://jdash.io/', 'JDash Dashboard Framework', null, 'See in Action')
                        session.send(res);
                        break;
                    case 'aibrite':
                        this.sendThumbnailCard(session, 'Aibrite', 'http://aibrite.com/wp-content/uploads/2017/03/cropped-cropped-logo-1-e1490694687582.png', 'http://aibrite.com/', 'MACHINE INTELLIGENCE AND SMART DATA VISUALIZATIONS', 'As being a machine intelligence & data visualization company we can add artificial intelligence to your existing applications. We can analyse your data and automatically generate smart data visualizations. You can also use our dashboard framework Jdash to add drag-drop dashboards into your applications.', 'Homepage')
                        session.send(res);
                        break;
                    case 'address':
                        session.send(res);
                        break;
                    case 'email':
                        session.send(res);
                        break;
                    case 'phone':
                        session.send(res);
                        break;
                    case 'team':
                        session.send(res);
                        break;
                    case 'jdash_plans':
                        var receipts = [];
                        jdashPlans.forEach((plan: IJdashPlan) => {
                            var receipt = this.createReceiptCard(session, plan.name, plan.price, plan.appLimit, plan.userLimit, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png', 'http://app.jdash.io', 'See Demo');
                            receipts.push(receipt);
                        });
                        var plans = this.createNewMessage(session, 'carousel', receipts)
                        session.send(res);
                        session.send(plans)
                        // session.beginDialog('/subscribe')
                        break;
                    default:
                        session.send(res);
                }
            } else {
                session.send('Could not get response from Watson.');
            }

        }).catch((err) => {
            console.log(err);
            session.send('Error: Cannot connect to Watson');
        })
    }

    constructor() {
        super();
    }
}

export default new WatsonBase();