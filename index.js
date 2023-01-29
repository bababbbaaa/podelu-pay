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
    const podeluChatId = -1001866133787;
    const chatProlongPrice = 2900;
    const chatPrice = 4900;
    const halfYearProlongPrice = 14500;
    const yearProlongPrice = 29000;

    await client.connect();

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

        if (msg.text === 'Test') {
            try {
                await setDoc(
                    doc(
                        getFirestore(firebaseApp),
                        'payments',
                        crypto.randomUUID()
                    ),
                    {
                        from: '147796272',
                        price: 100,
                        created_at: Timestamp.fromDate(new Date()),
                    }
                );
            } catch (error) {
                console.log(error);
            }
        }

        if (msg.text === '/start') {
            bot.sendMessage(
                msg.chat.id,
                `Добро пожаловать в платёжный бот Чата по делу. 👋 \n\nЗдесь вы можете: \n\n🔸 Получить доступ в чат (напишите «Вступить в чат»)\n🔸 Продлить доступ в чат (напишите «Продлить»)\n🔸 Продлить доступ в чат на год (напишите «Продлить на год»)\n\nПо всем вопросам вы можете обращаться к @nicholasitnikov
                `
            );
            client.getDialogs();
        }

        if (msg.text === 'Вступить в чат') {
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Оплата доступа в Чат по делу',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    {
                        label: 'Доступ в Чат по делу',
                        amount: chatPrice * 100,
                    },
                    {
                        label: 'Комиссия платёжного сервиса',
                        amount: chatPrice * 0.03 * 100,
                    },
                ])
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

        if (msg.text === 'Продлить на полгода') {
            // пол года
            bot.sendInvoice(
                msg.chat.id,
                'Чат по делу',
                'Продление доступа на полгода',
                JSON.stringify({ from: msg.from.id }),
                process.env.ROBOKASSA_PAYMENT_ACCESS_TOKEN,
                'RUB',
                JSON.stringify([
                    {
                        label: 'Продление доступа на полгода',
                        amount: halfYearProlongPrice * 100,
                    },
                    {
                        label: 'Комиссия платёжного сервиса',
                        amount: halfYearProlongPrice * 0.03 * 100,
                    },
                ])
            );
        }

        if (msg.text === 'Продлить на год') {
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

    // const getInviteLink = async () => {
    //     const result = await client.invoke(
    //         new Api.messages.ExportChatInvite({
    //             peer: -1001866133787,
    //             legacyRevokePermanent: false,
    //             requestNeeded: false,
    //             expireDate: 0,
    //             usageLimit: 1,
    //             title: 'Ссылка на вступление в чат',
    //         })
    //     );
    //     return result;
    // };

    bot.on('successful_payment', async (message) => {
        const payload = JSON.parse(
            message?.successful_payment?.invoice_payload
        );
        const result = await bot.getChatMember(message.chat.id, payload.from);

        const nick = result.user.username
            ? `@${result.user.username}`
            : result.user.id;

        try {
            bot.sendMessage(
                notificationChatId,
                `Пришло ${
                    message.successful_payment.total_amount / 100
                }₽ от ${nick}`
            );
            bot.sendMessage(
                podeluChatId,
                `Пришло ${
                    message.successful_payment.total_amount / 100
                }₽ от ${nick}`
            );
        } catch (error) {}

        try {
            console.log(
                payload?.from,
                message?.successful_payment?.total_amount / 100
            );
            await setDoc(
                doc(getFirestore(firebaseApp), 'payments', crypto.randomUUID()),
                {
                    from: payload?.from,
                    price: message?.successful_payment?.total_amount / 100,
                    created_at: Timestamp.fromDate(new Date()),
                }
            );
        } catch (error) {
            console.log(error);
        }

        if (message.successful_payment.total_amount / 100 > 3500) {
            const messageText =
                'Благодарим за оплату. Чтобы получить получить доступ в чат напишите @nicholasitnikov 🤝';
            bot.sendMessage(message.chat.id, messageText);
        } else {
            const messageText =
                'Благодарим за оплату. Доступ в чат продлён на месяц 🤝';
            bot.sendMessage(message.chat.id, messageText);
        }
    });
})();
