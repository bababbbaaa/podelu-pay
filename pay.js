const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

dotenv.config();

(async () => {
    const apiId = parseInt(process.env.API_ID);
    const apiHash = process.env.API_HASH;

    const session = new StringSession(process.env.SESSION_STRING); // You should put your string session here
    const client = new TelegramClient(session, apiId, apiHash, {});

    const token = process.env.PAYMENT_BOT_ACCESS_TOKEN;
    const bot = new TelegramBot(token, { polling: true });
    await client.connect();

    bot.on('message', async (msg) => {
        if (msg.text === '/start') {
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Оплата добавления в платный чат',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    { label: 'Оплата доступа', amount: 504700, isTest: true },
                ])
            );
        }
    });

    bot.on('pre_checkout_query', (query) => {
        bot.answerPreCheckoutQuery(query.id, true);
    });

    bot.on('successful_payment', async (message) => {
        // const result = await getInviteLink();

        const result = await client.invoke(
            new Api.users.GetUsers({
                id: [message.from.id],
            })
        );
        bot.sendMessage(
            -1001899025139,
            `Пришло 4900₽ от @${result[0].username} (${result[0].phone})`
        );

        // const messageText = `Благодарим за оплату, ваш платёж успешно совершён.\n\nВ чате необходимо представится, написать из какого вы города, сколько у вас квартир и какую пользу вы хотите получить от чата.\n\nТакже рекомендую изучать чат с самого начала — таким образом вы получите ответы на большинство вопросов 🤝\n\nСсылка на добавление в чат: ${result.link}`;
        const messageText =
            'Благодарим за оплату, ваш платёж успешно совершён. Для подтверждения оплаты необходимо отправить ваш номер телефона @nicholasitnikov';
        bot.sendMessage(message.chat.id, messageText);
    });
})();
