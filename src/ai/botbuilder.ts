import * as botbuilder from 'botbuilder';
import * as restify from 'restify';

export class BotBase {

    bot: botbuilder.UniversalBot;
    weather: object;

    loadBot(server: restify.Server) {
        return new Promise((resolve, reject) => {

            var connector = new botbuilder.ChatConnector({
                appId: process.env.microsoft_appId,
                appPassword: process.env.microsoft_appPass
            });

            this.bot = new botbuilder.UniversalBot(connector, (session) => {
                session.beginDialog('/watson');
            });
            server.post('/api/messages', connector.listen());
            resolve();
        })
    }

    createNewMessage(session: botbuilder.Session, layoutType: string, attachments?: any[]) {
        return new botbuilder.Message(session)
            .attachmentLayout(botbuilder.AttachmentLayout.carousel)
            .attachments(attachments);
    }

    createReceiptCard(session: botbuilder.Session, title: string, price: string, appLimit: string, userLimit: string, imageUrl: string, buttonUrl: string, buttonText?: string) {
        return new botbuilder.ReceiptCard(session)
            .title(title.toUpperCase())
            .facts([
                botbuilder.Fact.create(session, appLimit, 'App Limit'),
                botbuilder.Fact.create(session, userLimit, 'User Limit')
            ])
            .items([
                botbuilder.ReceiptItem.create(session, '$' + price, 'JDash Cloud Service')
                    .quantity('720')
                    .image(botbuilder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
            ])
            .total('$' + price)
            .buttons([
                botbuilder.CardAction.openUrl(session, buttonUrl, buttonText || 'More Information')
            ]);
    }

    sendAllServicesCards(session: botbuilder.Session) {
        var cards = [
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

        var reply = new botbuilder.Message(session)
            .attachmentLayout(botbuilder.AttachmentLayout.carousel)
            .attachments(cards);

        return session.send(reply);
    }

    sendThumbnailCard(session: botbuilder.Session, title: string, imageUrl: string, buttonUrl: string, subtitle?: string, text?: string, buttonText?: string) {
        var thumbNail = new botbuilder.ThumbnailCard(session)
            .title(title)
            .subtitle(subtitle || 'Info')
            .text(text || 'Click the link below for more!')
            .images([
                botbuilder.CardImage.create(session, imageUrl)
            ])
            .buttons([
                botbuilder.CardAction.openUrl(session, buttonUrl, buttonText || 'Check Out')
            ]);

        var reply = new botbuilder.Message(session)
            .attachmentLayout(botbuilder.AttachmentLayout.list)
            .addAttachment(thumbNail);

        return session.send(reply);
    }

    saveWeather(report) {
        this.weather = report;
    }

    constructor() {

    }
}

export default new BotBase();