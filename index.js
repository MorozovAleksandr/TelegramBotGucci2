process.env.NTBA_FIX_319 = 1

var TelegramBot = require('node-telegram-bot-api');

// Устанавливаем токен, который выдавал нам бот.

var token = '1693253125:AAFb2XvgOUQ_AlJnl2pb4QGwboQXca4kfdI'; // 922777706:AAGQU6l-8l2UMJ9qRVaQRyo59gQAzHGxrik  766599402:AAGMExKVovquBJq8QA0RDkVqq2yQT7G4PmI

// Включить опрос сервера
var bot = new TelegramBot(token, {
    polling: true
});

var user = [];

user.nick = undefined;

var menu = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{
                text: 'Перезапустить опрос'
            }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    })
};

var questions = [{
    title: 'Вашему аккаунту Facebook больше 6 месяцев?',
    buttons: [
        [{
            text: 'Да',
            callback_data: '0_1'
        }],
        [{
            text: 'Нет',
            callback_data: '0_2'
        }],
    ],
    right_answer: 1
},

{
    title: 'Ваш аккаунт Facebook заполнен (содержит информацию об учебе или работе, есть фото, друзья, записи на стене)?',
    buttons: [
        [{
            text: 'Да',
            callback_data: '1_1'
        }],
        [{
            text: 'Нет',
            callback_data: '1_2'
        }],
    ],
    right_answer: 1
},
{
    title: 'Вы сдавали ранее аккаунт Facebook в аренду?',
    buttons: [
        [{
            text: 'Да',
            callback_data: '2_1'
        }],
        [{
            text: 'Нет',
            callback_data: '2_2'
        }],
    ],
    right_answer: 2
},
{
    // title: 'К Вашему аккаунту привязана действующая почта и действующий мобильный телефон?',
    title: 'Вы хотели бы сдать аккаунт в аренду или продать?',
    buttons: [
        [{
            text: 'Аренда',
            callback_data: '3_1_0'
        }],
        [{
            text: 'Продажа',
            callback_data: '3_1_1'
        }],
    ],
    right_answer: 1
},
];

function newQuestion(msg) {
    console.log(user);
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    var arr;
    for (let i = 0; i < user.length; i++) {
        if (user[i].id === chat) {
            arr = questions[user[i].answerNumber];
        }
    }
    var text = arr.title;

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: arr.buttons,
            parse_mode: 'Markdown'
        })
    };

    for (let i = 0; i < user.length; i++) {
        if (user[i].id === msg.from.id && user[i].answerNumber < questions.length) {
            user[i].answerNumber++;
        }
    }
    bot.sendMessage(chat, text, options);
}

bot.on('callback_query', function onCallbackQuery(msg) {
    var answer = msg.data.split('_');
    var index = answer[0]; // номер вопроса
    var button = answer[1]; // кнопка ответа 0 || 1
    if (questions[index].right_answer == button) {
        for (let i = 0; i < user.length; i++) {
            if (index == 3) {
                if (user[i].id === msg.from.id) {
                    var typeOfTransaction = answer[2];
                    if (typeOfTransaction == 0) {
                        user[i].typeOfTransaction = 'Аренда';
                    }
                    if (typeOfTransaction == 1) {
                        user[i].typeOfTransaction = 'Продажа';
                    }
                }
            }
            if (user[i].id === msg.from.id) {
                user[i].countRightAnswer++;
            }
        }
    }

    for (let i = 0; i < user.length; i++) {
        if (user[i].id === msg.from.id && user[i].answerNumber === questions.length) {
            endPoll(msg);
        }
    }

    newQuestion(msg);
});

bot.on('message', function (msg) {
    for (let i = 0; i < user.length; i++) {
        if (user[i].id === msg.from.id && user[i].countRightAnswer === questions.length) {
            user.instaLogin = msg.text;
            bot.sendMessage(msg.from.id, "Отлично, скоро с вами свяжутся:)");
            bot.sendMessage(869162443, `${user[i].typeOfTransaction}. Новая заявка! - @${msg.from.username}.(id ${msg.from.id}). Instagram login - ${user.instaLogin}`); //230431843 - hokage, newHokage - 841422237, my - 273352112, new - 869162443
            user.splice(i, 1);
            break;
        }
    }
});

function endPoll(msg) {
    for (let i = 0; i < user.length; i++) {
        if (user[i].id === msg.from.id && user[i].countRightAnswer === questions.length) {
            bot.sendMessage(msg.from.id, "Спасибо за пройденный опрос! Оставьте логин на свой Instagram или ссылку на любую другую социальную сеть для связи с Вами, также укажите город проживания.");
        } else {
            if (user[i].id === msg.from.id && user[i].answerNumber === questions.length) {
                bot.sendMessage(msg.from.id, "К сожалению вы нам не подходите, попробуйте в следующий раз.");
                user.splice(i, 1);
                break;
            }
        }
    }
}

bot.onText(/\/start/, function (msg, match) {
    myStart(msg);
});

bot.onText(/\Перезапустить опрос/, (msg, match) => {
    myStart(msg);
});

function myStart(msg) {
    for (let i = 0; i < user.length; i++) {
        if (user[i].id === msg.from.id) {
            user.splice(i, 1);
        }
    }

    user.push({
        id: msg.from.id,
        answerNumber: 0,
        countRightAnswer: 0,
        answerNumberWithAccount: 0,
        instaLogin: null,
        typeOfTransaction: null
    });
    bot.sendMessage(msg.from.id, `Добрый день :) 
Мы – команда молодых SMM-специалистов. Недавно мы начали развивать направление Facebook Ads и столкнулись с проблемой ограниченных рекламных возможностей в этой социальной сети.
К сожалению, Facebook запрещает создавать рекламные объявления со свежих аккаунтов, а также ограничивает создание объявлений с одного аккаунта.   
Страниц нужно много и создавать сами мы не можем, это долго и неэффективно. Поэтому наша команда берет активные страницы в аренду у вас. 

Безопасно ли это? 
Да! Никаких постов от вашего имени и спама – Ваши друзья не догадаются, что вы зарабатываете на своей страничке Facebook. 

Пройдите небольшой опрос, который займет меньше 1 минуты, чтобы мы могли узнать больше об аккаунте Facebook:
  `, menu);
    setTimeout(newQuestion.bind(this, msg), 2000);
}