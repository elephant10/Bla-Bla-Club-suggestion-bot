const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const { Telegraf, Markup, Extra, InlineKeyboardButton  } = require('telegraf');

const FileApiKey = 'api key.txt';
let apiKey;
try {
  apiKey = fs.readFileSync(FileApiKey, 'utf8');
} catch (err) {
  console.error("11 line    "  + err);
}
const bot = new Telegraf(apiKey)

const authorizedUserIds = [
  497250936, 622436187
]; // Array of authorized user IDs

// let conversationEnded = true;
const messageMap = {};
const chatMessageMap = {};

function getUserMessageId(adminId, adminMessageId) {
  for (const key in messageMap) {
    const mapping = messageMap[key];
    if (mapping.adminUserId === adminId && mapping.adminMessageId === adminMessageId) {
      return mapping.userMessageId;
    }
  }
  return null; 
}

function getAdminMessageId (adminId, userId, userMessageId){
  for (const key in messageMap) {
    const mapping = messageMap[key];
    if (mapping.adminUserId == adminId && mapping.userId == userId && mapping.userMessageId == userMessageId) {
      return mapping.adminMessageId;
    }
  }

  return null;
}


function getUserId(adminUserId, adminMessageId) {
  const mapping = chatMessageMap[`${adminUserId}:${adminMessageId}`];
  if (mapping) {
    return mapping.userId;
  }
  return null;
}

function addMessageMapping(userId, userMessageId, adminUserId, adminMessageId) {
  messageMap[`${adminUserId}:${adminMessageId}`] = {
    adminUserId: adminUserId,
    adminMessageId: adminMessageId,
    userId: userId,
    userMessageId: userMessageId
  };
  chatMessageMap[`${adminUserId}:${adminMessageId}`] = {
    userId: userId,
    userMessageId: userMessageId
  };
}


function getUserNameById (userid){
  const fs = require('fs');
  //console.log("WE ARE HERE BECAUSE WE ARE HERE")
  const data = fs.readFileSync('users.json', 'utf8')
  
    // Parse the JSON string into an array of objects
    const arr = JSON.parse(data);
    // Search for an object with user id 777 in the array
    const obj = arr.find((o) => "" + o.userID == "" + userid);
    // If the object is found, log it
   // console.log(obj);
    if (obj) {
     return  obj.first_name + " " + obj.second_name + " " + (obj.tag != "" ? "@" + obj.tag : "") + " " + obj.userID
    } else {
      return " unknown user"
    };

  //return "error, probably, it isn't intended to be seen "
}

const ongoingReports = new Map(); // Map of ongoing reports, where each key is a chat ID and the value is the chat ID of the initial user who started the report
// Command handler for "/connect" command
bot.command('connect', (ctx) => {
  const chatId = ctx.chat.id;
  // conversationEnded = false;
 // console.log(ctx)
  const listener = async (ctx) => {

    if(!ongoingReports.has(chatId)){
            // If conversation has ended, do nothing

        return;
    }
    // if (conversationEnded) {
    //   // If conversation has ended, do nothing
    //   return;
    // }
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name || "";
    const username = ctx.from.username || "";
    const text = ctx.message.text || "no text";
    const media = ctx.message.photo || ctx.message.video || ctx.message.document || ctx.message.voice || ctx.message.audio || ctx.message.sticker || ctx.message.animation;
    const forwardedMessage = ctx.message.forward_from || ctx.message.forward_from_chat;
    


    if (authorizedUserIds.includes(ctx.from.id)) {
      // Check if authorized user has replied to a specific message
      const repliedMessageId = ctx.message.reply_to_message?.message_id;
      console.log("116 line    "  + repliedMessageId)
      if (repliedMessageId) {
        // Send the response to the user who reported the problem
        const messageId = ongoingReports.get(chatId);
        if (messageId) {
          if(!getUserId(ctx.from.id, repliedMessageId)){
            await ctx.reply('Відповідати можна лише на повідомлення юзерів. Реплай на своє чи технічне повідомлення (як це) юзеру не прийде. ');
            return;
          }
          let responseFromAdmin;
          if (forwardedMessage) {
            await bot.telegram.sendMessage(getUserId(ctx.from.id, repliedMessageId), `Відповідь від Bla Bla Club: \n`, { reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });

          responseFromAdmin = await ctx.forwardMessage(getUserId(ctx.from.id, repliedMessageId), ctx.from.id, ctx.message.message_id, { reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
          } 
          if (media){
           //console.log("media")
           let caption = ctx.message.caption ? "Відповідь від Bla Bla Club: \n" + ctx.message.caption : "Відповідь від Bla Bla Club: \n";
            if (ctx.message.photo  ){
         ///     console.log(ctx.message.photo);
              responseFromAdmin = await bot.telegram.sendPhoto(getUserId(ctx.from.id, repliedMessageId), ctx.message.photo[0].file_id, {caption: caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
            }  else if (ctx.message.video) {
      ///        console.log(ctx.message.video);

              responseFromAdmin = await bot.telegram.sendVideo(getUserId(ctx.from.id, repliedMessageId), ctx.message.video.file_id, {caption: caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });

            }
            else if ( ctx.message.document) {
            //  console.log(ctx.message.document);

              responseFromAdmin = await bot.telegram.sendDocument(getUserId(ctx.from.id, repliedMessageId), ctx.message.document.file_id, {caption: caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });

            }
            else if (ctx.message.voice) {
              responseFromAdmin = await bot.telegram.sendVoice(getUserId(ctx.from.id, repliedMessageId), ctx.message.voice.file_id, {caption:caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
              } else if (ctx.message.audio) {
              responseFromAdmin =  await bot.telegram.sendAudio(getUserId(ctx.from.id, repliedMessageId), ctx.message.audio.file_id, { caption:caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
              } else if (ctx.message.sticker) {
                await bot.telegram.sendMessage(getUserId(ctx.from.id, repliedMessageId), `Відповідь від Bla Bla Club: \n`, { reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
                responseFromAdmin =  await bot.telegram.sendSticker(getUserId(ctx.from.id, repliedMessageId), ctx.message.sticker.file_id, {reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
              } else if (ctx.message.animation) {
              responseFromAdmin = await bot.telegram.sendAnimation(getUserId(ctx.from.id, repliedMessageId), ctx.message.animation[0].file_id, {caption:caption, reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
              }
          //    console.log("toooot " + JSON.stringify(responseFromAdmin))

          }
          else {
        //    console.log("text")
            responseFromAdmin = await bot.telegram.sendMessage(getUserId(ctx.from.id, repliedMessageId), `Відповідь від Bla Bla Club: \n ${text}`, { reply_to_message_id: getUserMessageId(ctx.from.id, repliedMessageId) });
          }
          // Notify authorized user that the response is sent to user
          
          await bot.telegram.sendMessage(ctx.from.id, `Твоя відповідь відправлена студенту(ці) ${getUserNameById(getUserId(ctx.from.id, repliedMessageId))}`  );
          // console.log(responseFromAdmin);
          // while (!responseFromAdmin.from || responseFromAdmin.from == undefined || responseFromAdmin.from == null){
          //     console.log(responseFromAdmin == false)
          //     console.log(JSON.stringify(responseFromAdmin))
          // }
     //     console.log("allll " + JSON.stringify(responseFromAdmin))

           for (let i = 0; i < authorizedUserIds.length; i++) {
                const adminId = authorizedUserIds[i];
                if (adminId == ctx.from.id ){
                  continue;
                }

            //    console.log(JSON.stringify(responseFromAdmin))
             //   console.log(JSON.stringify(responseFromAdmin.chat.id))
                //console.log("161 line " + responseFromAdmin + "\n \n" + responseFromAdmin.message.chat + "\n" + responseFromAdmin.message.from + "\n" )
              //  console.log("162 line " + responseFromAdmin.message.chat.id + "\n \n" + responseFromAdmin.message.from.id)
                await bot.telegram.sendMessage(adminId, `відповідь іншого адміна ${getUserNameById(ctx.from.id)}`, {reply_to_message_id: getAdminMessageId(adminId, responseFromAdmin.chat.id, responseFromAdmin.reply_to_message.message_id)} );
               yy = await bot.telegram.forwardMessage(adminId, responseFromAdmin.chat.id, responseFromAdmin.message_id, {reply_to_message_id: getAdminMessageId(adminId, responseFromAdmin.chat.id, responseFromAdmin.reply_to_message.message_id)});
                //console.log("164 line + " + yy)
           }
        } else {
          // Notify the authorized user to respond to a specific message
          await bot.telegram.sendMessage(ctx.from.id, "Будь ласка, відповідай на конкретне повідомлення.");
        }
      } else {
        // Notify the authorized user to respond to a specific message
        await bot.telegram.sendMessage(ctx.from.id, "Будь ласка, відповідай на конкретне повідомлення.");
      }
    } else {
      // Notify the admins about the problem
      
      const bannedIds = fs.readFileSync('ban.txt', 'utf8').split('\n');

      if (bannedIds.includes("" + ctx.from.id)) {
        console.log(`нам пише забанений User ${getUserNameById(ctx.from.id)}`);
        return ctx.reply("Ти в бані :)\nВ BBC тебе не чують");
      }
      console.log(`Problem reported by: ${firstName} ${lastName} (${username}): ${text}`)
      const reportMessage = "Повідомлення від студента(ки) " + getUserNameById(ctx.from.id) + "\n" ;
      for (let i = 0; i < authorizedUserIds.length; i++) {
        const adminId = authorizedUserIds[i];
        let messageFromUser;
        if (forwardedMessage) {
            console.log("forward")
            bot.telegram.sendMessage(adminId, reportMessage );
            messageFromUser = await ctx.forwardMessage(adminId, ctx.from.id, ctx.message.message_id);
        } else if (media) {
            console.log("media")
            let caption = ctx.message.caption ? reportMessage + ctx.message.caption : reportMessage;

            if (ctx.message.photo || ctx.message.video || ctx.message.document){
            messageFromUser = await bot.telegram.sendCopy(adminId, ctx.message, { caption: caption});
            }
            else if (ctx.message.voice) {
                messageFromUser =  await bot.telegram.sendVoice(adminId, ctx.message.voice.file_id, { caption:caption });
            } else if (ctx.message.audio) {
                messageFromUser =  await bot.telegram.sendAudio(adminId, ctx.message.audio.file_id, { caption:caption });
            } else if (ctx.message.sticker) {
                bot.telegram.sendMessage(adminId, reportMessage );
                messageFromUser =  await bot.telegram.sendSticker(adminId, ctx.message.sticker.file_id, { caption: caption });
            } else if (ctx.message.animation) {
                messageFromUser =  await bot.telegram.sendAnimation(adminId, ctx.message.animation.file_id, { caption: caption });
            }
        } else {
            console.log("text")

            messageFromUser = await bot.telegram.sendMessage(adminId, reportMessage + ` ${text}`);
        }
      //  console.log("SECS" + ctx.message.message_id)
        addMessageMapping(ctx.from.id, ctx.message.message_id, adminId, messageFromUser.message_id)
      }
      // Send notification to user that the problem is reported
      await ctx.reply('Дякуємо! Повідомлення передано Bla Bla Club. Ми відповімо тобі найближчим часом ✨');
      ongoingReports.set(chatId, ctx.message.message_id);
    }
  };

  bot.on('text', listener);
  bot.on('photo', listener);
  bot.on('video', listener);
  bot.on('document', listener);
  bot.on('forward', listener);
  bot.on('voice', listener);
  bot.on('audio', listener);
  bot.on('sticker', listener);
  bot.on('animation', listener);
  
  
  // Send notification to user that problem is being reported to admins
  ctx.reply('Привіт, це Bla Bla Club');
  ongoingReports.set(chatId, ctx.message.message_id);
});



function saveUserId(userId) {
  userId = "" + userId;
  // Read the existing user ids from the file
  const FileUserId = 'userIds.txt';
  let existingIds = [];
  try {
    existingIds = fs.readFileSync(FileUserId, 'utf8').split('\n');
  } catch (err) {
    console.error("249 linw " + err);
  }

  // If the user id is not already in the file, add it
  if (!existingIds.includes(userId)) {
    existingIds.push(userId);

    // Write the updated user ids to the file
    try {
      fs.writeFileSync(FileUserId, existingIds.join('\n'));
      console.log(`User id ${userId} has been added to the file.`);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log(`User id ${userId} is already in the file.`);
  }
}


bot.start((ctx) => {
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name || "";
  const username =  ctx.from.username || "";
  console.log(`User ${firstName} ${lastName} (${username}) with ID ${ctx.from.id} started the bot.`);

  const userId = ctx.from.id;
  saveUserId(userId);
  ctx.reply("Привіт! \n\n" + 

  "Це бот команди Bla Bla Club. Щоб зв'язатися з нами, натисни /connect.\n" +
  "Аби дізнатись, що вміє бот, натисни /help.\n\n"+

  "Ми відповімо тобі найближчим часом ✨ ");
  


  const fs = require('fs');

  fs.readFile('users.json', 'utf8', (err, data) => {
    // Handle any errors
    if (err) {
      console.error("261 line    " + err);
      return;
    }
    // Parse the JSON string into an array of objects
    const arr = JSON.parse(data);
    // Search for an object with user id 777 in the array
    const obj = arr.find((o) => o.userID === userId);
    // If the object is found, log it
    if (obj) {
      console.log(`Object with user id ${userId} already in userData :`);
    } else {
      // If not, create a new object with user id 777 and any other properties you want
      const userData = {
        userID: ctx.from.id,
        first_name: firstName,
        second_name: lastName,
        tag: username
      };
      // Push the new object to the array
      arr.push(userData);
      // Convert the array to a JSON string
      const json = JSON.stringify(arr, null, 2);
      // Write the JSON string to the file
      fs.writeFile('users.json', json, (err) => {
        // Handle any errors
        if (err) {
          console.error("312 ine " + err);
          return;
        }
        // Success message
        console.log(`Object with user id ${userId} added to file`);
      });
    }
  });
  //saving to json


});

bot.help((ctx) => {
  console.log(`user ${ctx.from.id} asked for help`)
 let helpMessage = "Ось що вміє наш бот:\n\n" +
    "/start - запустити/перезавантажити бота\n" +
    "/help - що вміє бот\n" +
    //"/contacts - контакти працівників(ць) факультету\n" +
    "/connect - зв'язатися з командою Bla Bla Club\n" +
   // "/closestevents - найближчі події\n" +
    "/endconversation - завершити розмову з Bla Bla Club";

if(authorizedUserIds.includes(ctx.from.id)){
    helpMessage += "\n/ban - забанити користувача(ку). Для цього введіть разом з командою id цілі бану. Наприклад, /ban 12345678. Звичайні користувачі не знають про цю команду.";
}

  ctx.reply(helpMessage);
});



/*
bot.command('events', (ctx) => {
    console.log(`user ${ctx.from.id} qurious about events `);

const fs = require('fs');
 
const eventsData = fs.readFileSync('events.json');
const events = JSON.parse(eventsData);
const isEmpty = (Array.isArray(events) && !events.length) || (typeof events === 'object' && !Object.keys(events).length);


  if (!isEmpty) {
  const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEvents.forEach((event) => {
      const message = `
Назва: ${event.title}
Опис: ${event.description}
Дата: ${event.date}
Посилання: ${event.link}
`;
      ctx.reply(message, { parse_mode: 'HTML' });
    });

  
  } else {
    ctx.reply('Упс, нажаль на найближчий час подій не заплановано, але ми уже працюємо над цим. \nМожеш нам запропонувати, якщо маєш якісь ідеї :)');
  }
});
*/
/*
bot.command('contacts', (ctx) => {
  console.log(`user ${ctx.from.id} looked for contacts`);

  const contactsData = fs.readFileSync('contacts.json');
  const contacts = JSON.parse(contactsData);

  if (contacts) {

    const buttons = contacts.map((contact) => {
      return [
        {
         text: `${contact.job}:${contact.name}`,
          callback_data: `show_contact_${contact.id}`
        }
      ];
    });

    const message = 'Контакти посадових осіб факультету. \n<i>"з" позначає заступник або помічник з конкретного питання</i>';
    const keyboard = Markup.inlineKeyboard(buttons);
    ctx.reply(message, { 
      reply_markup: {
        inline_keyboard: buttons,
          resize_keyboard: true,
          one_time_keyboard: true          
      },
      parse_mode: 'HTML'
  });
  } else {
    ctx.reply('No contacts found.');
  }
});

bot.action(/show_contact_(.*)/, async (ctx) => {
  const contactId = ctx.match[1];
  const contactsData = fs.readFileSync('contacts.json');
  const contacts = JSON.parse(contactsData);
  const contact = contacts.find((c) => c.id === contactId);

  if (contact) {
    const message = `
<b>${contact.name} </b>
${contact.job}
Email: ${contact.mail}
Telegram: ${contact.telegram}
Phone: ${contact.phone}
<a href="${contact.image}">фото</a>
`;
    ctx.reply(message,{ parse_mode: 'HTML' });
  } else {
    ctx.reply('Contact not found.');
  }
});
*/
bot.command('endconversation', async (ctx) => {
  const chatId = ctx.chat.id;
  // if (conversationEnded) {
  //   ctx.reply("щоб завершити розмову, її потрібно почати");
  //   return;
  // }
  // Remove chatId from ongoingReports map
  if(!ongoingReports.has(chatId)){
    ctx.reply("Щоб завершити розмову, її потрібно почати");
      return;
  }
  ongoingReports.delete(chatId);
  
  // Notify admins that the user ended the conversation

  const message = `Студент(ка) ${getUserNameById(ctx.from.id)} завершив(ла) розмову.`;
  for (let i = 0; i < authorizedUserIds.length; i++) {
    const adminId = authorizedUserIds[i];
    await bot.telegram.sendMessage(adminId, message);
  }
  // Send thank you message to the user
  await ctx.reply('Have a nice day! Bye 👋');

});

bot.command('ban', async (ctx) => {

  if (!authorizedUserIds.includes(ctx.from.id)) {
      ctx.reply("молодець, вгадав команду бана. Але вона не для тебе :)")
      return;
  }

// Parse the user ID from the message text
console.log("461 line "  + ctx.message.text);
let userId = parseInt(ctx.message.text.split(' ')[1]);
if (!userId) {
  // Ask the admin to provide a valid user ID
  return ctx.reply("Ця команда потребує id користувача.\nНаприклад, /ban 12345678");
}
// Check if the user ID is valid
if (isNaN(userId)) {
  // Ask the admin to provide a valid user ID
  return ctx.reply("В бота болить живіт від такого, тобі не соромно за таке?\nДай йому тільки id коритувача і все, будь ласка. \nНаприклад, /ban 12345678");
}
userId = ""+userId;
const FileUserId = 'userIds.txt';
let existingIds = [];
try {
  existingIds = fs.readFileSync(FileUserId, 'utf8').split('\n');
} catch (err) {
  console.error("478 line    "  + err);
}

if (!existingIds.includes(userId)) {
  console.log(`User ${userId} doesn't use the bot`);
  return ctx.reply(`студент(ка) ${getUserNameById(userId)} не використовує бота`);
}

const bannedIds = fs.readFileSync('ban.txt', 'utf8').split('\n');

if (bannedIds.includes(userId.toString())) {
  console.log(`User ${userId} is already забанено.`);
  return ctx.reply(`користувача ${getUserNameById(userId)} забанили до тебе`);
}

fs.appendFileSync('ban.txt', `${userId}\n`);
console.log(`User id ${userId} has been added to the бан.`);
ctx.reply(`користувача ${getUserNameById(userId)} забанено. Так йому(їй) і треба`);
await bot.telegram.sendMessage(userId,  `Тебе забанили. Ти можеш користуватися ботом, однак не можеш писати в BBC. Живи з цим.`);

for (let i = 0; i < authorizedUserIds.length; i++) {
  const adminId = authorizedUserIds[i];
  if (adminId == ctx.from.id ){
    continue;
  }
  await bot.telegram.sendMessage(adminId,  `інший адмін  ${getUserNameById(ctx.from.id)} забанив користувача ${getUserNameById(userId)}`);
}
});


bot.launch();
