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

    createCardAttachments(session: botbuilder.Session) {
        return [
            new botbuilder.HeroCard(session)
                .title('Aibrite Artificial Intelligence')
                .subtitle('Artificial Intelligence and Machine Learning Implementations')
                .text('As being a machine intelligence & data visualization company we can add artificial intelligence to your existing applications. We use machine learning and natural language processing to make better predictions and design chatbots.')
                .images([
                    botbuilder.CardImage.create(session, 'http://bigdata-madesimple.com/wp-content/uploads/2016/04/Artificial-Intelligence.jpg')
                ])
                .buttons([
                    botbuilder.CardAction.openUrl(session, 'http://aibrite.com/', 'Learn More')
                ]),

            new botbuilder.ThumbnailCard(session)
                .title('Aibrite Smart Data Visualisation')
                .subtitle('Visualize Your Data In Seconds')
                .text('We use advanced data mining & machine learning tehniques to understand and visualize your data automatically. We can analyse your data and automatically generate smart data visualizations.')
                .images([
                    botbuilder.CardImage.create(session, 'https://cdn.outsource2india.com/webanalytics/images/data-visualization-sample.jpg')
                ])
                .buttons([
                    botbuilder.CardAction.openUrl(session, 'http://aibrite.com/', 'Discover')
                ]),

            new botbuilder.HeroCard(session)
                .title('Aibrite Dashboards')
                .subtitle('JDash Dashboard Framework')
                .text('Jdash allows you to add drag-drop dashboards into your product. It provides javascript + backend platform for adding end user designable dashboards into your web application.')
                .images([
                    botbuilder.CardImage.create(session, 'http://aibrite.com/wp-content/uploads/2015/12/jdash-dashboard-drag-drop-finger.png')
                ])
                .buttons([
                    botbuilder.CardAction.openUrl(session, 'http://jdash.io/', 'See in Action')
                ])
        ];
    }

}

export default new BotBase();