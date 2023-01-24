const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const { initializeApp } = require('firebase/app');
require('firebase/firestore');
const { doc, getFirestore, setDoc, Timestamp } = require('firebase/firestore');
const crypto = require('crypto');

const firebaseApp = initializeApp({
    apiKey: 'AIzaSyDln11HXwFB7pIYD_ySyIl_j1RWnurxJ34',
    authDomain: 'podelu-309ea.firebaseapp.com',
    projectId: 'podelu-309ea',
    storageBucket: 'podelu-309ea.appspot.com',
    messagingSenderId: '444086589170',
    appId: '1:444086589170:web:04bd8a745bf313cd68226b',
    measurementId: 'G-VZ52GHSV6T',
});

dotenv.config();

(async () => {
    const apiId = parseInt(process.env.API_ID);
    const apiHash = process.env.API_HASH;

    const session = new StringSession(process.env.SESSION_STRING); // You should put your string session here
    const client = new TelegramClient(session, apiId, apiHash, {});

    const token = process.env.PAYMENT_BOT_ACCESS_TOKEN;
    const bot = new TelegramBot(token, { polling: true });

    const notificationChatId = -1001899025139;
    const chatProlongPrice = 50;
    const chatPrice = 4900;
    const yearProlongPrice = 29000;

    await client.connect();

    const getUser = async () => {
        const result = await client.invoke(
            new Api.users.GetFullUser({
                id: 147796272,
            })
        );
        return result;
    };

    bot.on('message', async (msg) => {
        if (msg.text === 'Продлить') {
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Продление доступа Чата по делу',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    {
                        label: 'Оплата доступа',
                        amount: chatProlongPrice * 100,
                    },
                    {
                        label: 'Комиссия платёжного сервиса',
                        amount: chatProlongPrice * 0.03 * 100,
                    },
                ])
            );
        }

        if (msg.text === '/start') {
            bot.sendMessage(
                msg.chat.id,
                `Добро пожаловать в платёжный бот Чата по делу. 👋 \n\nЗдесь вы можете: \n\n🔸 Получить доступ в чат (команда /join)\n🔸 Продлить доступ в чат (команда /prolong)\n\nПо всем вопросам вы можете обращаться к @nicholasitnikov
                `
            );
        }

        if (msg.text === 'Вступить в чат') {
            bot.sendMessage(
                msg.chat.id,
                'Для оплаты доступа в чат необходимо связаться с @nicholasitnikov'
            );
        }

        if (msg.text === 'Продлить 22c585f75c24d937f90165dc341b1dbd') {
            // отзыв
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Продление доступа со скидкой за отзыв',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    {
                        label: 'Продление доступа',
                        amount: 1450 * 100,
                    },
                    {
                        label: 'Комиссия платёжного сервиса',
                        amount: 1450 * 0.03 * 100,
                    },
                ])
            );
        }

        if (msg.text === 'Оплатить год') {
            // год
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Продление доступа на год',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    {
                        label: 'Продление доступа на год',
                        amount: yearProlongPrice * 100,
                    },
                    {
                        label: 'Комиссия платёжного сервиса',
                        amount: yearProlongPrice * 0.03 * 100,
                    },
                ])
            );
        }
    });

    bot.on('pre_checkout_query', (query) => {
        bot.answerPreCheckoutQuery(query.id, true);
    });

    bot.on('successful_payment', async (message) => {
        const result = await getUser(message.from.id);
        try {
            bot.sendMessage(
                notificationChatId,
                `Пришло ${message.successful_payment.total_amount / 100}₽ от @${
                    result?.users[0]?.username
                }`
            );
        } catch (error) {}

        try {
            await setDoc(
                doc(getFirestore(firebaseApp), 'payments', crypto.randomUUID()),
                {
                    from: message.from.id,
                    price: message.successful_payment.total_amount / 100,
                    created_at: Timestamp.fromDate(new Date()),
                }
            );
        } catch (error) {}

        const messageText =
            'Благодарим за оплату. Доступ в чат продлён на месяц 🤝';
        bot.sendMessage(message.chat.id, messageText);
    });
})();
