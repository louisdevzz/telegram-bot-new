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
    ]).extra(),
  proofofseshfinal:()=> Markup.inlineKeyboard([
      [
        Markup.callbackButton('🔥 BLUNT', 'select_blunt')
      ],
      [
        Markup.callbackButton('🤙 JOINT', 'select_joint')
      ],
      [
        Markup.callbackButton('👽 SPLIFF', 'select_spliff')
      ],
      [
        Markup.callbackButton('⏪ Back', 'helper')
      ]
  ]).extra(),
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
    ]).extra(),
  checkbalance: () => Markup.inlineKeyboard([
    [
      Markup.callbackButton('Max','max')
    ],
    [
      Markup.callbackButton('⏪ Back', 'helper')
    ]
  ]).extra(),
  mintvibeBlank: () => Markup.inlineKeyboard([
    [
      Markup.callbackButton('1','rateEnegery_1'),
      Markup.callbackButton('2','rateEnegery_2'),
    ],
    [
      Markup.callbackButton('3','rateEnegery_3'),
      Markup.callbackButton('4','rateEnegery_4'),
    ],
    [
      Markup.callbackButton('5','rateEnegery_5'),
      Markup.callbackButton('6','rateEnegery_6'),
    ],
    [
      Markup.callbackButton('7','rateEnegery_7'),
      Markup.callbackButton('8','rateEnegery_8'),
    ],
    [
      Markup.callbackButton('9','rateEnegery_9'),
      Markup.callbackButton('10','rateEnegery_10'),
    ],
    [
      Markup.callbackButton('⏪ Back','helper'),
    ]   
  ]).extra(),
  getRateEnegery: () => Markup.inlineKeyboard([
    [
      Markup.callbackButton('1','rateFriendliness_1'),
      Markup.callbackButton('2','rateFriendliness_2'),
    ],
    [
      Markup.callbackButton('3','rateFriendliness_3'),
      Markup.callbackButton('4','rateFriendliness_4'),
    ],
    [
      Markup.callbackButton('5','rateFriendliness_5'),
      Markup.callbackButton('6','rateFriendliness_6'),
    ],
    [
      Markup.callbackButton('7','rateFriendliness_7'),
      Markup.callbackButton('8','rateFriendliness_8'),
    ],
    [
      Markup.callbackButton('9','rateFriendliness_9'),
      Markup.callbackButton('10','rateFriendliness_10'),
    ],
    [
      Markup.callbackButton('⏪ Back','helper'),
    ]   
  ]).extra(),
  getRateFriendliness: () => Markup.inlineKeyboard([
    [
      Markup.callbackButton('1','rateDensity_1'),
      Markup.callbackButton('2','rateDensity_2'),
    ],
    [
      Markup.callbackButton('3','rateDensity_3'),
      Markup.callbackButton('4','rateDensity_4'),
    ],
    [
      Markup.callbackButton('5','rateDensity_5'),
      Markup.callbackButton('6','rateDensity_6'),
    ],
    [
      Markup.callbackButton('7','rateDensity_7'),
      Markup.callbackButton('8','rateDensity_8'),
    ],
    [
      Markup.callbackButton('9','rateDensity_9'),
      Markup.callbackButton('10','rateDensity_10'),
    ],
    [
      Markup.callbackButton('⏪ Back','helper'),
    ]   
  ]).extra(),
  getRateDensity: () => Markup.inlineKeyboard([
    [
      Markup.callbackButton('1','rateDiversity_1'),
      Markup.callbackButton('2','rateDiversity_2'),
    ],
    [
      Markup.callbackButton('3','rateDiversity_3'),
      Markup.callbackButton('4','rateDiversity_4'),
    ],
    [
      Markup.callbackButton('5','rateDiversity_5'),
      Markup.callbackButton('6','rateDiversity_6'),
    ],
    [
      Markup.callbackButton('7','rateDiversity_7'),
      Markup.callbackButton('8','rateDiversity_8'),
    ],
    [
      Markup.callbackButton('9','rateDiversity_9'),
      Markup.callbackButton('10','rateDiversity_10'),
    ],
    [
      Markup.callbackButton('⏪ Back','helper'),
    ]   
  ]).extra(),
  mintnft:()=>Markup.inlineKeyboard([
    [
      Markup.callbackButton("🤖 Autogenerate Description","mintNFTautogenerate")
    ],
    [
      Markup.callbackButton("😐 Leave Blank","mintNFTblank")
    ],
    [
      Markup.callbackButton("⏪ Back","helper")
    ]
  ]).extra(),
  mintNFTmyself:()=>Markup.inlineKeyboard([
    [
      Markup.callbackButton("Myself","mintNFTmyself")
    ],
    [
      Markup.callbackButton("⏪ Back","helper")
    ]
  ]).extra(),
  postnearsoical:()=>Markup.inlineKeyboard([
    [
      Markup.callbackButton("🆙 Post Now!","post")
    ],
    [
      Markup.callbackButton("⏪ Back","helper")
    ]
  ]).extra(),
  logout:()=>Markup.inlineKeyboard([
    [
      Markup.callbackButton("🔐 Logout","action_logout")
    ],
    [
      Markup.callbackButton("⏪ Back","helper")
    ]
  ]).extra(),
  transfer:()=>Markup.inlineKeyboard([
    [
      Markup.callbackButton("Transfer NEAR / Token","transfertoken")
    ],
    [
      Markup.callbackButton("Transfer NFT","transfernft")
    ],
    [
      Markup.urlButton("❓Help","https://t.me/+8yc5jSm3ObcwZjZh")
    ],
    [
      Markup.callbackButton("⏪ Back","helper")
    ]
  ]).extra(),
  
}
