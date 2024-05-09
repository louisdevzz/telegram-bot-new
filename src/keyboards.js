const {Markup} = require('telegraf');

// module.exports = {
//   actionsList: () => Markup.inlineKeyboard([
//     Markup.callbackButton('Add repository', 'addRepo'),
//     Markup.callbackButton('Subscriptions', 'editRepos'),
//     Markup.callbackButton('Get releases', 'getReleases')
//   ]).extra(),
//   adminActionsList: () => Markup.inlineKeyboard([
//     Markup.callbackButton('Send message', 'sendMessage'),
//     Markup.callbackButton('Stats', 'getStats'),
//   ]).extra(),
//   backToAdminActions: () => Markup.inlineKeyboard([
//     Markup.callbackButton('Back', `adminActionsList`)
//   ]).extra(),
//   backToActions: () => Markup.inlineKeyboard([
//     Markup.callbackButton('Back', `actionsList`)
//   ]).extra(),
//   addOneMoreRepo: () => Markup.inlineKeyboard([
//     Markup.callbackButton('Yes', `addRepo`),
//     Markup.callbackButton('Nope', `actionsList`)
//   ]).extra(),
//   expandButton: (data) => Markup.inlineKeyboard([
//     Markup.callbackButton('Expand', `getReleases:expand:${data}`)
//   ]).extra(),
//   allOrOneRepo: () => Markup.inlineKeyboard([
//     [
//       Markup.callbackButton('All subscriptions', `getReleases:all`),
//       Markup.callbackButton('One repository', `getReleases:one`)
//     ],
//     [
//       Markup.callbackButton('Back', `actionsList`)
//     ]
//   ]).extra(),
//   table: (backActionName, actionName, items) => Markup.inlineKeyboard([
//     ...items.map((item, index) => [Markup.callbackButton(item, `${actionName}:${index}`)]),
//     [
//       Markup.callbackButton('Back', backActionName)
//     ]
//   ]).extra(),
//   //ToDo: pagination
//   paginationTable: (backActionName, actionName, items) => Markup.inlineKeyboard([
//     ...items.map((item, index) => [Markup.callbackButton(item, `${actionName}:${index}`)]),
//     [
//       Markup.callbackButton('prev', ''),
//       Markup.callbackButton('next', '')
//     ],
//     [
//       Markup.callbackButton('Back', backActionName)
//     ]
//   ]).extra(),
// };
module.exports={
  back:()=> Markup.inlineKeyboard([
      Markup.callbackButton('⏪ Back', 'helper'),
    ]).extra(),
  home:()=> Markup.inlineKeyboard([
      Markup.callbackButton('🏠 Home', 'helper'),
    ]).extra(),
  proofofsesh:()=> Markup.inlineKeyboard([
      [
        Markup.callbackButton('🔥 BLUNT', 'blunt')
      ],
      [
        Markup.callbackButton('🤙 JOINT', 'joint')
      ],
      [
        Markup.callbackButton('👽 SPLIFF', 'spliff')
      ],
      [
        Markup.callbackButton('⏪ Back', 'helper')
      ]
    ]).extra()
  ,
  helper: ()=>
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('💰 Check Balance', 'checkbalance')
      ],
      [
        Markup.callbackButton('🖼️ Mint NFT', 'mint_nft'),
        Markup.callbackButton('💬 Post Social', 'postnearsocial')
      ],
      [
        Markup.callbackButton('Transfer', 'transfer'),
      ],
      [
        Markup.callbackButton('😀 Mint a Vibe', 'mint_vibe')
      ],
      [
        Markup.urlButton('❓ Help', 'https://t.me/+8yc5jSm3ObcwZjZh'),
      ],
      [
        Markup.callbackButton("⚙️ Settings","setting")
      ]
    ]).extra()
}
