const {
	Composer,
	Context,
	Markup,
	Scenes,
    memorySession
}=require("telegraf");
const Telegraf = require("telegraf");
const axios =require("axios");
const dotenv=require("dotenv");
const RedisSession = require('telegraf-session-redis');
const keyboards = require("./keyboards");

dotenv.config();
const API_TOKEN = process.env.BOT_TOKEN;
if (API_TOKEN === undefined) {
	throw new TypeError("BOT_TOKEN must be provided!");
}
const session = new RedisSession({
    store: {
        host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
        port: process.env.TELEGRAM_SESSION_PORT || 6379
    },
});

class BotTest{
    constructor(logger){
        this.bot = new Telegraf(API_TOKEN);
        this.logger = logger;
        
        this.bot.use(session);
        
        this.bot.catch((err) => {
            this.logger.error(err);
        });
        this.bot.telegram.getMe().then((botInfo) => {
            this.bot.options.username = botInfo.username;
        });
        this.listen();
        this.logger.log('Bot listen');  
    }
    listen(){
        // const commands = [
        //     ['createwallet', this.createwallet],
        //     ['actions', this.actions],
        //     ['proofofsesh', this.proofofsesh],
        //     ['postsocialnear', this.postsocialnear],
        //     ['mintnft', this.mintnft],
        //     ['transfertoken', this.transfertoken],
        //     ['transfernft', this.transfernft],
        //     ['clear', this.clear],
        //     ['sync', this.sync],
        // ];
        // const actions = [
        //     ['createwallet', this.createwallet],
        //     ['transfertoken', this.transfertoken],
        //     ['mintvibe', this.mintvibe],
        //     ['transfernft', this.transfernft],
        //     ['mintnft', this.mintnft],
        //     ['backtotransfer', this.backtotransfer],
        //     ['postnearsocial', this.postnearsocial],
        //     ['back', this.back],
        //     ['logout', this.logout],
        //     ['checkbalance', this.checkbalance],
        //     ['setting', this.setting]
        //     ['transfer', this.transfer]
        // ];
        const commands = [
            ['start',this.start],
            ['createwallet', this.createwallet],
            ['actions', this.actions],
            ['helper', this.helper]
        ];
        const actions = [
            ['createwallet', this.createwallet],
            ['create_wallet', this.create_wallet],
            ['mint_vibe', this.mint_vibe],
            ['mint_nft', this.mint_nft],
			['mintNFTblank',this.mintNFTBlank],
			['mintNFTautogenerate',this.mintNFTAutogeneration],
			['mintNFTmyself',this.mintNFTMyself],
            ['checkbalance', this.checkbalance],
            ['transfer', this.transfer],
			['max', this.max],
			[/^selecttoken_(.+)$/, this.getselecttoken],
			['transfertoken',this.transfertoken],
			['blank',this.blank],
			['logout',this.logout],
			['actionLogout',this.actionLogout],
			['helper', this.helper]
        ]
        commands.forEach(([command, fn]) => this.bot.command(command, this.wrapAction(fn)));
        actions.forEach(([action, fn]) => this.bot.action(action, this.wrapAction(fn)));

        this.bot.hears(/.+/, this.wrapAction(this.handleBot));
		this.bot.on('photo',this.wrapAction(this.handleBot))

        this.bot.startPolling();
    }
    async notifyUsers(repos) {
        await this.sendReleases(
        null,
        repos,
        async (markdown, key, {watchedUsers}) => {
        await Promise.all(watchedUsers.map(async (userId) => {
            try {
            await this.bot.telegram.sendMessage(userId, markdown, Extra.markdown());
            } catch (error) {
            this.logger.error(`Cannot send releases to user: ${userId}`);
            this.logger.error(error.stack.toString());
            }
        }));
        }
    );
    };
    wrapAction(action) {
        return async (...args) => {
            try {
            return await action.apply(this, args);
            } catch (error) {
            this.logger.error(`uncaughtException: ${error.message}`);
            this.logger.error(error.stack.toString());
            }
        }
    }
    async actions(ctx) {
        ctx.session.action = null;

        return ctx.reply('Select an action', keyboards.actionsList());
    }
    async start(ctx,next){
		await ctx.replyWithHTML(
			`<b> 👋 Welcome to Drop Wallet</b>\nDrop Wallet creates you a wallet on the NEAR Blockchain directly through telegram. We pay for transactions within the wallet like posting on Near Social. \n <b> - You can check</b> :\n👉 Balance  \n👉 Transfer Tokens/NFTs \n👉 Mint NFT \n👉 Export your keys`,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: "Create Wallet",
							callback_data: "create_wallet",
						},],
					],
				},
			}
		);
		return next();
	}
    async handleBot(ctx, next) {
        console.log("photo",ctx.update?.message?.photo?.file_id)
        console.log("text",ctx.update?.message?.text)
        if(ctx.update?.message?.text){
			if(!ctx.match[0].startsWith("/")){
				if (ctx.session.action) {
					switch (ctx.session.action) {
						case 'createwallet':
							this.createwallet(ctx);
							ctx.session.action = null;
							break;
						case 'mintvibe':
							this.mintvibe(ctx);
							ctx.session.action = null;
							break;
						case 'minft_nft':
							this.uploadIPFS(ctx);
							ctx.session.action = null;
							break;	
						case 'uploadipfs':
							this.mintnft(ctx);
							ctx.session.action = null;
							break;	
						default:
							ctx.session.action = null;
							
					}
				}
			}
		}else{
			if(ctx.update?.message?.photo){
				if (ctx.session.action) {
					switch (ctx.session.action) {
						case 'mintvibe':
							this.mintvibe(ctx);
							ctx.session.action = null;
							break;
						default:
							ctx.session.action = null;
							
					}
				}
			}
		}
    }
    create_wallet(ctx){
        ctx.session.action = 'createwallet';
		ctx.answerCbQuery('');
        return this.editMessageText(ctx, "<b>Choose a username</b>\nType your human readable address username in the chatbot.");
    }
	mint_vibe(ctx){
		ctx.session.action = 'mintvibe';
		return this.editMessageText(ctx,"<b>Upload IRL Vibe(a picture)\n\nSupported file types;png;gif;jpeg (max 10mb)\n\nSend a picture</b>",keyboards.back())
	}
	mint_nft(ctx){
		ctx.session.action = 'mint_nft';
		return this.editMessageText(ctx,"<b>Mint a single NFT on genadrop contract\n(we pay minting cost).\n\nSupported file types;png;gif;jpeg (max 10mb)\n\nSend a picture</b>",keyboards.back())
	}
	async postnearsocial(ctx){
		await ctx.replyWithHTML(
			"<b>Send message to create a post on NEAR SOCIAL (hyperlinking + formatting supported)</b>", keyboards.back()
		);
	}
	async proofofsesh(ctx,next){
		if (ctx?.update?.message?.text == process.env.PROOF_OF_SESH) {

			await ctx.replyWithHTML("<b>✅ Correct Password. Watchu smoking on???</b>", keyboards.proofofsesh());
			return next();
		}
		if (ctx.session.proofofsesh) {
			await ctx.replyWithHTML("<b>✅ YOU ALREADY IN BLUNT DAO SILLY.Learn more at bluntdao.org</b>", keyboards.back());
			await ctx.replyWithHTML(`<b>📸Take a picture of the smoking stick</b>`, keyboards.home());
			return next();
		} else {
			await ctx.replyWithHTML("<b>What's the password????</b>", keyboards.back());
		}
	}
	
    async createwallet(ctx){
		var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
		if (!format.test(ctx.update?.message?.text.toLowerCase())) {
			await ctx.replyWithHTML(`<b>❌ Error not a valid Near address.</b>`, keyboards.back());
		} else {
			let newAccount = "";
			if (!ctx.update?.message?.text.includes(".near")) {
				newAccount = ctx.update?.message?.text?.toLowerCase() + ".near";
			} else {
				newAccount = ctx.update?.message?.text?.toLowerCase();
			}
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const stateAccount = await axios.post(
				"http://localhost:3000/api/account/state", {
				accountId: newAccount,
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			if (stateAccount.data?.response?.type == "AccountDoesNotExist") {
				try {

					const {
						data
					} = await axios.post(
						"http://localhost:3000/api/account/create", {
						accountId: newAccount.toLowerCase(),
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					if (data?.privateKey) {
						ctx.session.privateKey = data.privateKey;
						ctx.session.user_telegram = ctx.update?.message?.chat?.username;
						ctx.session.accountId = newAccount.toLowerCase();

						await ctx.deleteMessage(message_id);
						await ctx.replyWithHTML(
							`<b>✅ you are ${newAccount.toLowerCase()}</b>\n✔️going to wallet home page`
						);
						return this.helper(ctx);
					}
				} catch (error) {
					if (error.response?.data?.error?.type == "NotEnoughBalance") {
						await ctx.deleteMessage(message_id);
						await ctx.replyWithHTML(
							`<b>❌${newAccount.toLowerCase()} is not able to be created now </b>\nsend another address`, keyboards.back()
						);
					}
					if (
						error.response?.data?.error?.type == "REQUEST_VALIDATION_ERROR" ||
						error.response?.data?.error?.type == "CreateAccountOnlyByRegistrar"
					) {
						await ctx.deleteMessage(message_id);
						await ctx.replyWithHTML(
							`<b>❌${newAccount.toLowerCase()} is not valid</b>\nsend another address`,keyboards.back()
						);
					}
					if (error.response?.data?.error?.type == "AccountAlreadyExists") {
						await ctx.deleteMessage(message_id);
						return this.editMessageText(`<b>❌${newAccount.toLowerCase()} is taken!</b>\nsend another address`, keyboards.back())
					}
					if (error.response?.data?.error?.type == "CreateAccountNotAllowed") {
						await ctx.deleteMessage(message_id);
						await ctx.replyWithHTML(
							`<b>❌${newAccount.toLowerCase()} can't be created</b>\nsend another address`, keyboards.back()
						);
					}
				}
			} else {
				if (stateAccount.data?.response?.type == "REQUEST_VALIDATION_ERROR") {
					await ctx.deleteMessage(message_id);
					await ctx.replyWithHTML(
						`<b>❌${newAccount.toLowerCase()} is not valid!</b>\nsend another address`, keyboards.back()
					);
				}
			}
			if (stateAccount.data?.response.amount) {
				await ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(
					`<b>❌${newAccount.toLowerCase()} is taken!</b>\nsend another address`, keyboards.back()
				);
			}
		}
    }
    async checkbalance(ctx,next) {
        const {
            message_id
        } = await ctx.replyWithHTML(
            `<b>Loading...</b>`
        );
        try {
            const tokenList = await axios.post(
                "http://localhost:3000/api/account/balance", {
                accountId: ctx.session.accountId,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
            );
            let totalUSD = 0;
            tokenList.data.token.forEach((item) => {
                totalUSD += parseFloat(item.balanceInUsd);
            });
            let balanceMes =
                "<b>" +
                ctx.session.accountId +
                " balance</b>\n\n💰 Money (" +
                totalUSD +
                " USD)\n----------------------------------\n";
            tokenList.data.token.forEach((item) => {
                const textLength = (item.balance + " " + item.symbol).length * 3;
                const lengthDot = 50 - textLength;
                let dot = "";
                for (let index = 0; index < lengthDot; index++) {
                    dot += ".";
                }
                balanceMes +=
                    item.balance + " " + item.symbol + dot + item.balanceInUsd + ` USD\n`;
            });
            const {
                data
            } = await axios.post(
                "http://localhost:3000/api/account/nft", {
                accountId: ctx.session.accountId,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
            );
            let totalNft = 0;
    
            const contractOwnedList = Object.keys(data.nft);
            let nftList = "";
            contractOwnedList.forEach((item, index) => {
                totalNft += data.nft[item].length;
                nftList +=
                    `${data.nft[item][index].nft_contract_name
                        ? data.nft[item][index].nft_contract_name
                        : "Unkown Title"
                    } (${data.nft[item].length})` +
                    `..<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${data.nft[item][index].nft_contract_id}&tokenId=${data.nft[item][index].token_id}&chainState=near">Open</a>\n`;
            });
            balanceMes +=
                "\n🖼️ NFTs (" + totalNft + " NFT)\n----------------------------------\n";
            balanceMes += nftList;
            await ctx.deleteMessage(message_id);
            await ctx.replyWithHTML(balanceMes, {
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "🖼️ Open My NFTs",
                            url: `https://near.social/genadrop.near/widget/GenaDrop.Profile.Main?accountId=${ctx.session.accountId}`,
                        },],
                        [{
                            text: "📚 Open Transaction History",
                            url: `https://nearblocks.io/address/${ctx.session.accountId}`,
                        },],
                        [{
                            text: "⏪ Back",
                            callback_data: "back",
                        },],
                    ],
                },
            });
        } catch (error) {
            if (error.response?.data?.error?.message) {
                await ctx.reply(error.response?.data?.error?.message);
            } else {
                await ctx.replyWithHTML("<b>❌ Error</b>");
            }
        }
        return next();
    }
    async helper(ctx){
		if (ctx.session.privateKey && ctx.session.accountId) {
			return this.editMessageText(ctx,`<b>${ctx.session.accountId}</b>\nyou are logged in. Click button to use your wallet`, keyboards.helper())
		} else {
			return this.create_wallet(ctx);
		}
	}
	async actionLogout(ctx){
		await ctx.replyWithHTML(
			`<b>✅ you are logout</b>\n\nif you did not export your key than we cannot make you a new wallet`, keyboards.home()	
		);
		ctx.session.privateKey = null;
		ctx.session.accountId = null;
		ctx.session.selecttoken = null;
		ctx.session.selectNftCollection = null;
		ctx.session.nftOwned = null;
		ctx.session.postContent = null;
		ctx.session.postImage = null;
		ctx.session.selectNft = null;
		ctx.session.titleNFT = null;
		ctx.session.tokenContract = null;
		ctx.session.descriptionNFT = null;
		ctx.session.amountTransfertoken = null;
		ctx.session.reveicerToken = null;
		ctx.session.selectEnegry = null;
		ctx.session.selectFriendliness = null;
		ctx.session.selectDiversity = null;
		ctx.session.selectDensity = null;
		ctx.session.proofofsesh = null;
		ctx.session.selectStick = null;
		ctx.session.blunt_ref = null;
		ctx.session.cid = null;
		await ctx.leave();
		return this.helper(ctx);
	}
	async logout(ctx,next){
		await ctx.replyWithHTML(
			"<b> After you logout you cannot log in again </b>", keyboards.logout()
		);
	}
	async transfer(ctx){
			try {
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				const tokenList = await axios.post(
					"http://localhost:3000/api/account/balance", {
					accountId: ctx.session.accountId,
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				let totalUSD = 0;
				tokenList.data.token.forEach((item) => {
					totalUSD += parseFloat(item.balanceInUsd);
				});
				let balanceMes =
					"<b>" +
					ctx.session.accountId +
					" balance</b>\n\n💰 Money (" +
					totalUSD +
					" USD)\n----------------------------------\n";
				tokenList.data.token.forEach((item) => {
					const textLength = (item.balance + " " + item.symbol).length * 3;
					const lengthDot = 50 - textLength;
					let dot = "";
					for (let index = 0; index < lengthDot; index++) {
						dot += ".";
					}
					balanceMes +=
						item.balance + " " + item.symbol + dot + item.balanceInUsd + ` USD\n`;
				});
				const {
					data
				} = await axios.post<any>(
					"http://localhost:3000/api/account/nft", {
					accountId: ctx.session.accountId,
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				let totalNft= 0;
		
				const contractOwnedList = Object.keys(data.nft);
				let nftList = "";
				contractOwnedList.forEach((item, index) => {
					totalNft += data.nft[item].length;
					nftList +=
						`${data.nft[item][index].nft_contract_name
							? data.nft[item][index].nft_contract_name
							: "Unknown Title"
						} (${data.nft[item].length})` +
						`..<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${data.nft[item][index].nft_contract_id}&tokenId=${data.nft[item][index].token_id}&chainState=near">Open</a>\n`;
				});
				balanceMes +=
					"\n🖼️ NFTs (" + totalNft + " NFT)\n----------------------------------\n";
				balanceMes += nftList;
				ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(balanceMes,keyboards.transfer());
			} catch (error) {
				if (error.response?.data.error?.message) {
					await ctx.reply(error.response?.data?.error?.message);
				} else {
					await ctx.replyWithHTML("<b>❌ Error</b>");
				}
			}
	}
	async sync(ctx,next){
		const profile = await ctx.telegram.getChat(ctx.update.message.chat.id)
		const big_file = await ctx.telegram.getFileLink(profile.photo.big_file_id);
		const profileName = profile.last_name ? profile.first_name + " " + profile.last_name : profile.first_name;
	
		try {
			const {
				data
			} = await axios.post(
				"http://localhost:3000/api/nft/upload-ipfs/", {
				headers: {
					Accept: "application/json",
				},
				data: JSON.stringify({
					url: big_file,
				}),
			}
			);
			await axios.post(
				"http://localhost:3000/api/social/sync", {
				accountId: ctx.session.accountId,
				privateKey: ctx.session.privateKey,
				tgUserName: profile.username,
				tgName: profileName,
				tgUserBio: profile.bio,
				tgPicprofile: data.cid,
				tgBackground: ""
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			await ctx.replyWithHTML(
				`<b>✅ Synchronization with account completed <a href="https://near.social/mob.near/widget/ProfilePage?accountId=${ctx.session.accountId}">Open</a></b>`
			);
			return next();
		} catch (error) {
			await ctx.replyWithHTML(`<b>❌ Error.</b>`, keyboards.back());
		}
	
	}
	async max(ctx,next){
		try {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const tokenList = await axios.post<TokenListResponse>(
				"http://localhost:3000/api/account/balance", {
				accountId: ctx.session.accountId,
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			tokenList.data.token.forEach((element) => {
				if (element.symbol == ctx.session.selecttoken) {
					ctx.session.amountTransfertoken = element.balance;
					ctx.session.decimals = element.decimals;
				}
			});
			await ctx.deleteMessage(message_id);
			await ctx.replyWithHTML(
				`🔂 <b>Sending ${ctx.session.amountTransfertoken} ${ctx.session.selecttoken}</b>.\n\nType in a NEAR address to send FT token`, keyboards.back()
			);
			return next();
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async getselecttoken(ctx,next){
		const token = ctx.update?.callback_query?.data.split("_")[1];
		ctx.session.selecttoken = token;
		try {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const tokenList = await axios.post<TokenListResponse>(
				"http://localhost:3000/api/account/balance", {
				accountId: ctx.session.accountId,
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			let totalUSD = 0;
			tokenList.data.token.forEach((item) => {
				totalUSD += parseFloat(item.balanceInUsd);
			});
			let balanceMes =
				"<b>Type Amount or Put Max amount of Near you want to end\n\nYou have</b>\n----------------------------------\n";
			tokenList.data.token.forEach((item) => {
				if (item.symbol == ctx.session.selecttoken) {
					const textLength =
						(item.balance + " " + item.symbol).length * 3;
					const lengthDot = 50 - textLength;
					let dot = "";
					for (let index = 0; index < lengthDot; index++) {
						dot += ".";
					}
					ctx.session.tokenContract = item.contract;
					balanceMes +=
						item.balance + " " + item.symbol + dot + item.balanceInUsd + ` USD\n`;
				}
			});
			ctx.deleteMessage(message_id);
			await ctx.replyWithHTML(balanceMes, keyboards.checkbalance());
			return next();
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async transfertoken(ctx,next){
		async () => {
			try {
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				const tokenList = await axios.post(
					"http://localhost:3000/api/account/balance", {
					accountId: ctx.session.accountId,
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				let totalUSD = 0;
				tokenList.data.token.forEach((item) => {
					totalUSD += parseFloat(item.balanceInUsd);
				});
				let balanceMes =
					"<b>" +
					ctx.session.accountId +
					" balance</b>\n\n💰 Money (" +
					totalUSD +
					" USD)\n----------------------------------\n";
				tokenList.data.token.forEach((item) => {
					const textLength =
						(item.balance + " " + item.symbol).length * 3;
					const lengthDot = 50 - textLength;
					let dot = "";
					for (let index = 0; index < lengthDot; index++) {
						dot += ".";
					}
					balanceMes +=
						item.balance + " " + item.symbol + dot + item.balanceInUsd + ` USD\n`;
				});
	
				let tokenListSend = [];
				tokenList.data.token.forEach((item) => {
					tokenListSend.push([{
						text: `${item.symbol}`,
						callback_data: `selecttoken_${item.symbol}`,
					},]);
				});
				tokenListSend.push([{
					text: " Back",
					callback_data: "helper",
				},]);
				ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(balanceMes, Markup.inlineKeyboard(tokenListSend));
				return next();
			} catch (error) {
				await ctx.replyWithHTML("<b>❌ Error</b>");
			}
		},
		async () => {
			try {
				var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
				if (!format.test(ctx.update?.message?.text.toLowerCase())) {
					await ctx.replyWithHTML(`<b>❌ Error not a valid Near address.</b>`, keyboards.back());
	
				} else {
					const stateAccount = await axios.post<any>(
						"http://localhost:3000/api/account/state", {
						accountId: ctx.update?.message?.text,
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					if (
						stateAccount.data?.response?.type == "AccountDoesNotExist" ||
						stateAccount.data?.response.type == "REQUEST_VALIDATION_ERROR"
					) {
						await ctx.replyWithHTML(
							`<b>❌ this address does not exist. try again</b>`, keyboards.back()
						);
					}
	
					ctx.session.reveicerToken = ctx.update?.message?.text.toLowerCase();
					if (stateAccount.data?.response.amount) {
	
						const {
							message_id
						} = await ctx.replyWithHTML(
							`<b>Loading...</b>`
						);
						const {
							data
						} = await axios.post<StatusResonse>(
							`http://localhost:3000/api/token/transfer`, {
							accountId: ctx.session.accountId,
							privateKey: ctx.session.privateKey,
							receiverId: ctx.session.reveicerToken,
							amount: (
								ctx.session.amountTransfertoken *
								Math.pow(10, ctx.session.decimals)
							).toLocaleString("fullwide", {
								useGrouping: false
							}) + "",
							tokenContract: ctx.session.tokenContract,
						}, {
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
							},
						}
						);
						await ctx.deleteMessage(message_id);
						if (data.status) {
							return await ctx.replyWithHTML(`<b>✅ Success </b>`, keyboards.home());
						} else {
							await ctx.replyWithHTML(`<b>❌ Error cannt transfer. try again</b>`, keyboards.home());
						}
					}
	
				}
	
			} catch (error) {
				const err = await error;
				if (err?.response?.data?.error?.type == "NotEnoughBalance") {
					return await ctx.replyWithHTML("<b>❌ You do not have enough balance to transfer.\n\nPlease enter a smaller transfer amount</b>", keyboards.back());
				} else {
					await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
				}
	
			}
		}
	}
	async setting(ctx){
		console.log(`${process.env.TELE_APP_DOMAIN}?account_id=${ctx.session.accountId}&private_key=${ctx.session.privateKey}`);
		await ctx.replyWithHTML(
			`<b>${ctx.session.accountId}</b>\n\nManager your wallet here\nOnce you sign out we will not make another on your behalf to prevent from bots`, {
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[{
						text: "🔑 Export your keys",
						web_app: {
							url: `${process.env.TELE_APP_DOMAIN}?account_id=${ctx.session.accountId}&private_key=${ctx.session.privateKey}`,
						},
					},],
					[{
						text: "🔐 Logout",
						callback_data: "logout",
					},],
					[{
						text: "⏪ Back",
						callback_data: "helper",
					},],
				],
			},
		}
		);
	}
	async mintvibe(ctx,next){
		try {
			if (ctx.update?.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				ctx.session.fileUrl = fileUrl;
				const {
					data
				} = await axios.post(
					"http://localhost:3000/api/nft/upload-ipfs/", {
					headers: {
						Accept: "application/json",
					},
					data: JSON.stringify({
						url: fileUrl,
					}),
				}
				);
				if (data.cid) {
					await ctx.replyWithHTML(
						`<b>✅Posted photo successfully.\nSend a message to say what you feel .</b>`, {
						reply_markup: {
							inline_keyboard: [
								[{
									text: "😐 Leave Blank",
									callback_data: "blank",
								},],
								[{
									text: "⏪ Back",
									callback_data: "helper",
								},],
							],
						},
					}
					);
					ctx.session.cid = data.cid;
					return next();
				} else {
					await ctx.replyWithHTML("<b>❌Error upload to IPFS failed</b>");
				}
			} else {
				await ctx.replyWithHTML(
					"<b>❌ Error unsupported file type.\n\nSupported file types;png,gif,jpeg (max 10mb)\n\nResend a picture</b>", keyboards.back()
				);
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b> "+error, keyboards.back());
		}
	}
	async blank(ctx,next){
		ctx.session.content = "";
		await ctx.replyWithHTML(
				`<b>Rate the ⚡️energy (was the vibe calm or very active) with 10 being the most active</b>`, keyboards.mintvibeBlank()
		);
		return next();
	}
	async autogenerate(ctx,next){
		try {
			const content = await axios.post(
				"https://api.openai.com/v1/chat/completions", {
				model: "gpt-3.5-turbo",
				messages: [{
					role: "user",
					content: `write a caption post to twitter ${ctx.session.fileUrl}`,
				},],
				max_tokens: 64,
				temperature: 1,
			}, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.CHAT_GPT}`,
				},
			}
			);

			if (content.data.choices[0].message.content) {
				ctx.session.content = content.data.choices[0].message.content;

				await ctx.replyWithHTML(
					`<b>Rate the ⚡️energy (was the vibe calm or very active) with 10 being the most active</b>`, keyboards.mintvibeBlank()
				);
				return next();
			}
		} catch (e) {
			await ctx.replyWithHTML("<b>❌ Error</b>", {
				reply_markup: {
					inline_keyboard: [
						[{
							text: "Myself",
							callback_data: "myself",
						},],
						[{
							text: "⏪ Back",
							callback_data: "helper",
						},],
					],
				},
			});
		}
	}
	async mintvibecontent(ctx,next){
		ctx.session.content = ctx.update?.message?.text;

			await ctx.replyWithHTML(
				`<b>Rate the ⚡️energy (was the vibe calm or very active) with 10 being the most active</b>`, keyboards.mintvibeBlank()
			);
			return next();
	}
	async getRateEnegery(ctx,next){
		const rate = ctx.update?.callback_query?.data.split("_")[1];
			ctx.session.selectEnegry = rate;
			await ctx.replyWithHTML(
				`You selected <b>${rate}</b>⚡️for energy`
			);
			await ctx.replyWithHTML(
				`<b>Rate the ❤️ friendliness (how friendly was people) with 10 being the most friendly</b>`, keyboards.getRateEnegery()
		);
			return next();
	}
	async getRateFriendliness(ctx,next){
		const rate = ctx.update?.callback_query?.data.split("_")[1];
			ctx.session.selectFriendliness = rate;
			await ctx.replyWithHTML(
				`You selected <b>${rate}</b> ❤️ for friendliness`
			);
			await ctx.replyWithHTML(
				`<b>Rate the 🧊 density (were you were alone or was the vibe packed) with 10 being the most backed</b>`, keyboards.getRateFriendliness()
			);
			return next();
	}
	async getRateDensity(ctx,next){
		const rate = ctx.update?.callback_query?.data.split("_")[1];
			ctx.session.selectDensity = rate;
			await ctx.replyWithHTML(
				`You selected <b>${rate}</b> 🧊 for density`
			);
			await ctx.replyWithHTML(
				`<b>Rate the 🌈 diversity (was the vibe full of the same type of people or was the culture diverse) with 10 being the most diverse</b>`, keyboards.getRateDensity()
			);
			return next();
	}
	async getRateDiversity(ctx,next){
		if (!ctx.session.selectDiversity) {
			const rate = ctx.update?.callback_query?.data.split("_")[1];
			ctx.session.selectDiversity = rate;
			await ctx.replyWithHTML(
				`You selected <b>${rate}</b> 🌈 for diversity`
			);
		}
		if (ctx.session.selectEnegry && ctx.session.selectFriendliness && ctx.session.selectDensity && ctx.session.selectDiversity && ctx.session.cid) {

			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const res = await axios.post<any>(
				"http://localhost:3000/api/social/vibes", {
				accountId: ctx.session.accountId,
				privateKey: ctx.session.privateKey,
				cid: ctx.session.cid,
				friendliness: ctx.session.selectFriendliness,
				energy: ctx.session.selectEnegry,
				density: ctx.session.selectDensity,
				diversity: ctx.session.selectDiversity,
				content: ctx.session.content || ""
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			await ctx.deleteMessage(message_id);
			if (res.data.result?.transaction_outcome?.outcome?.status) {
				await ctx.replyWithHTML(
					`<b>✅ You successfully posted on NEAR Social for vibes. <a href="https://near.social/mob.near/widget/MainPage.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">(See link)</a>\n⌛️ The image will take ~10 minutes to show on NEAR Social </b>`, keyboards.home()
				);
				const tokenId = Date.now() + "";
				await axios.post(
					"http://localhost:3000/api/nft/mint", {
					title: `${ctx.session.accountId.replace(".near", "")} ${new Date().toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}`,
					description: `#ProofOfVibes #   @proofofvibes.near ${ctx.session.content} \n ## **Vibe-rating**  ❤️ **Friendliness:** ${ctx.session.selectFriendliness}/10 ⚡️ **Energy:** ${ctx.session.selectEnegry}/10 🧊 **Density:** ${ctx.session.selectDensity}/10 🌈 **Diversity:** ${ctx.session.selectDensity}/10`,
					cid: ctx.session.cid,
					privateKey: ctx.session.privateKey,
					accountId: ctx.session.accountId,
					receiverNFT: ctx.session.accountId,
					tokenId: tokenId
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
			}
		}
	}
	async uploadIPFS(ctx,next){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				ctx.session.fileUrl = fileUrl;
				const {
					data
				} = await axios.post<CidResonse>(
					"http://localhost:3000/api/nft/upload-ipfs/", {
					headers: {
						Accept: "application/json",
					},
					data: JSON.stringify({
						url: fileUrl,
					}),
				}
				);
				if (data.cid) {
					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\n Type in Your title for your NFT (Max 20 character), no links or special characters</b>`, keyboards.back()
					);
					ctx.session.cid = data.cid;
					return ctx.session.action = "uploadipfs";
				} else {
					await ctx.replyWithHTML("<b>❌Error upload to IPFS failed</b>");
				}
			} else {
				await ctx.replyWithHTML(
					"<b>❌ Error unsupported file type.\n\nSupported file types;png,gif,jpeg (max 10mb)\n\nResend a picture</b>", keyboards.back()
				);
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async mintnft(ctx,next){
		const regex = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

		if (regex.test(ctx.update?.message?.text)) {
			await ctx.replyWithHTML(
				"<b>❌ Error NFT title cannot contain special characters\n\nType in Your title for your NFT (min 4 character),no links or special characters</b>",keyboards.back()
			);
		} else {
			if (ctx.update?.message?.text?.length < 4) {
				await ctx.replyWithHTML(
					"<b>❌ Error NFT title too short\n\nType in Your title for your NFT (min 4 character),no links or special characters</b>", keyboards.back()
				);
			}
			if (ctx.update?.message?.text?.length > 20) {
				await ctx.replyWithHTML(
					"<b>❌ Error NFT title too long\n\nType in Your title for your NFT (min 4 character),no links or special characters</b>", keyboards.back()
				);
			}
			if (
				ctx.update?.message?.text?.length > 3 &&
				ctx.update?.message?.text.length < 20
			) {
				await ctx.replyWithHTML(
					`<b>✅ Successfully titled NFT "${ctx.update?.message?.text}"\n\nAdd description,max 200 characters.Links allowed.</b>`, keyboards.mintnft()
				);
				ctx.session.titleNFT = ctx.update?.message?.text;
				return this.mintNFTSuccess(ctx,next);
			}
		}
	}
	async mintNFTAutogeneration(ctx,next){
		try {
			const description = await axios.post<any>(
				"https://api.openai.com/v1/chat/completions", {
				model: "gpt-3.5-turbo",
				messages: [{
					role: "user",
					content: `write a caption post to twitter ${ctx.session.fileUrl}`,
				},],
				max_tokens: 64,
				temperature: 1,
			}, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.CHAT_GPT}`,
				},
			}
			);

			if (description.data.choices[0].message.content) {
				ctx.session.descriptionNFT =
					description.data.choices[0].message.content;
				await ctx.replyWithHTML(
					`<b>✅ Successfully put description\n\nNow who are you minting your "${ctx.session.titleNFT}" NFT to?\n\n</b>Enter valid Near Account`,keyboards.mintNFTmyself()
				);
				return ctx.next();
			}
		} catch (error) {
			console.log(error)
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.mintNFTmyself());
		}
	}
	async mintNFTBlank(ctx,next){
		ctx.session.descriptionNFT = "";
			await ctx.replyWithHTML(
				`<b>✅ Successfully put description\n\nNow who are you minting your "${ctx.session.titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
			);
			return next();
	}
	async mintNFTError(ctx){
		await ctx.replyWithHTML(
			"<b>❌ Error description title too long\n\n Add description, max 200 characters.Links allowed.</b>", keyboards.mintnft()
		);
	}
	async mintNFTSuccess(ctx,next){
		if(ctx.update?.message?.text.length > 200){
			this.mintNFTError(ctx)
		}
		ctx.session.descriptionNFT = ctx.update?.message?.text;
		await ctx.replyWithHTML(
			`<b>✅ Successfully put description\n\nNow who are you minting your "${ctx.session.titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
		);
		return next();
	}
	async mintNFTMyself(ctx,next){
		let receiverNFT = null;
		ctx.session.receiverNFT = ctx.session.accountId;
		receiverNFT = ctx.session.accountId;

		try {
			var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
			if (!format.test(ctx.callback_query?.message?.text.toLowerCase())) {
				await ctx.replyWithHTML(
					`<b>❌ Error not a valid Near address.\n\nNow who are you minting your "${ctx.session.titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
				);
			} else {
				const stateAccount = await axios.post<any>(
					"http://localhost:3000/api/account/state", {
					accountId: receiverNFT,
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				if (stateAccount.data?.response?.amount) {
					ctx.session.receiverNFT = ctx.update?.message?.text.toLowerCase();
					const tokenId = Date.now() + "";
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const nft = await axios.post<any>(
						"http://localhost:3000/api/nft/mint", {
						title: ctx.session.titleNFT,
						description: ctx.session.descriptionNFT,
						cid: ctx.session.cid,
						privateKey: ctx.session.privateKey,
						accountId: ctx.session.accountId,
						receiverNFT: receiverNFT,
						tokenId: tokenId

					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					if (
						nft?.data?.result?.transaction_outcome?.outcome?.status
							?.SuccessReceiptId
					) {
						await ctx.deleteMessage(message_id);
						return await ctx.replyWithHTML(
							`<b>✅You successfully minted "${ctx.session.titleNFT}" NFT to user <a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=nft.genadrop.near&tokenId=${tokenId}&chainState=near">(Open)</a></b>`, keyboards.home()
						);
					}
				}
				if (
					stateAccount.data?.response?.type == "AccountDoesNotExist" ||
					stateAccount.data?.response?.type == "REQUEST_VALIDATION_ERROR"
				) {
					await ctx.replyWithHTML(
						`<b>❌ Error this near doesnt exists.\n\nNow who are you minting your "${ctx.session.titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
					);
				}
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>",keyboards.back());
		}
	}
	async postNearSocial(ctx,next){
		ctx.session.postContent = ctx?.update?.message?.text;
			await ctx.replyWithHTML("<b>Upload Image to Post . Supported file types;png;gif;jpeg (max 10mb) Send a picture</b>",keyboards.postnearsoical());
	}
	async post(ctx,next){
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>Loading...</b>`
		);
		const res = await axios.post(
			"http://localhost:3000/api/social/post", {
			cid: null,
			privateKey: ctx.session.privateKey,
			accountId: ctx.session.accountId,
			content: ctx.session.postContent,
		}, {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		}
		);
		await ctx.deleteMessage(message_id);
		if (res.data.result?.transaction_outcome?.outcome?.status) {
			return await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">Open</a>) </b>`,keyboards.home());
		}
	}
	async postNearSocialFinal(ctx,next){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} = ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				const {
					data
				} = await axios.post<CidResonse>(
					"http://localhost:3000/api/nft/upload-ipfs/", {
					headers: {
						Accept: "application/json",
					},
					data: JSON.stringify({
						url: fileUrl,
					}),
				}
				);
				if (data.cid) {
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const res = await axios.post(
						"http://localhost:3000/api/social/post", {
						cid: data.cid,
						privateKey: ctx.session.privateKey,
						accountId: ctx.session.accountId,
						content: ctx.session.postContent,
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					await ctx.deleteMessage(message_id);
					if (res.data.result?.transaction_outcome?.outcome?.status) {
						return await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">Open</a>) </b>`,keyboards.home());
					}
				} else {
					await ctx.replyWithHTML(
						"<b>❌ Error upload image/file.</b>\n\nRepost with suppored image",keyboards.back()
					);
				}
			} else {
				await ctx.replyWithHTML(
					"<b>❌ Error image/file not supported.</b>\nExceeds limit or wrong type.(Jpg, gif,png up to 20mb supported)\n\nRepost with suppored image",keyboards.back()
				);
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async proofOfSesh(ctx,next){
		ctx.session.selectStick = ctx.update?.callback_query?.data;
			await ctx.replyWithHTML(`<b>YOU HAVE CHOSEN ${ctx.session.selectStick.toUpperCase()}</b>`);
			await ctx.replyWithHTML(`<b>📸Take a picture of the smoking stick</b>`, keyboards.back());
		return next();
	}
	async proofOfSeshFinal(ctx,next){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				ctx.session.fileUrl = fileUrl;
				const {
					data
				} = await axios.post<CidResonse>(
					"http://localhost:3000/api/nft/upload-ipfs/", {
					headers: {
						Accept: "application/json",
					},
					data: JSON.stringify({
						url: fileUrl,
					}),
				}
				);
				if (data.cid) {
					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\nSend a message to say what you feel</b>`, keyboards.back()
					);

					ctx.session.cid = data.cid;
					if (ctx.session.proofofsesh) {
						await ctx.replyWithHTML("<b> Watchu smoking on???</b>", keyboards.proofofseshfinal());
						return next();

					} else {
						await ctx.replyWithHTML(
							`<b>WHO REFERED YOU. PUT THEIR .NEAR handle / telegram handle or name</b>`, keyboards.back()
						);
						return next();
					}

				} else {
					await ctx.replyWithHTML("<b>❌Error upload to IPFS failed</b>");
				}
			} else {
				await ctx.replyWithHTML(
					"<b>❌ Error unsupported file type.\n\nSupported file types;png,gif,jpeg (max 10mb)\n\nResend a picture</b>",keyboards.back()
				);
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async getSelect(ctx,next){
		ctx.session.selectStick = ctx.update?.callback_query?.data.split("_")[1];
		await ctx.replyWithHTML(
			`<b>✅ YOU HAVE CHOSEN ${ctx.session.selectStick.toUpperCase()}\n\nSend a message to say what you feel</b>`, keyboards.back()
		);
		return next();
	}
	async getAllSelect(ctx,next){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				ctx.session.fileUrl = fileUrl;
				const {
					data
				} = await axios.post<CidResonse>(
					"http://localhost:3000/api/nft/upload-ipfs/", {
					headers: {
						Accept: "application/json",
					},
					data: JSON.stringify({
						url: fileUrl,
					}),
				}
				);
				if (data.cid) {

					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\nSend a message to say what you feel</b>`,keyboards.back()
					);
					ctx.session.cid = data.cid;
					if (ctx.session.proofofsesh) {

						return ctx.wizard.next();
					} else {
						await ctx.replyWithHTML(
							`<b>WHO REFERED YOU. PUT THEIR .NEAR handle / telegram handle or name</b>`,keyboards.home()
						);
						return next();
					}

				} else {
					await ctx.replyWithHTML("<b>❌Error upload to IPFS failed</b>");
				}
			} else {
				await ctx.replyWithHTML(
					"<b>❌ Error unsupported file type.\n\nSupported file types;png,gif,jpeg (max 10mb)\n\nResend a picture</b>", keyboards.back()
				);
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>",keyboards.back());
		}
	}
	async getSelectFinal(ctx,next){
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>Loading...</b>`
		);
		const res = await axios.post(
			"http://localhost:3000/api/social/post", {
			cid: ctx.session.cid,
			privateKey: ctx.session.privateKey,
			accountId: ctx.session.accountId,
			content: ctx?.update?.message?.text + "\n@bluntdao.near #ProofOfSesh #BluntDAO",
		}, {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		}
		);
		await ctx.deleteMessage(message_id);
		if (res.data.result?.transaction_outcome?.outcome?.status) {
			await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">Open</a>) </b>`, keyboards.back());
			const tokenId = Date.now() + ""
			await axios.post(
				"http://localhost:3000/api/nft/mint", {
				title: `BluntDao NFT #${ctx.session.selectStick}`,
				description: `${ctx?.update?.message?.text} @bluntdao.near #ProofOfSesh #BluntDAO #${ctx.session.selectStick}`,
				cid: ctx.session.cid,
				privateKey: ctx.session.privateKey,
				accountId: ctx.session.accountId,
				receiverNFT: ctx.session.accountId,
				tokenId: `bluntdao.${ctx.session.selectStick}.${tokenId}`
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
		}

	}
	async postProofOfSeshFinal(ctx,next){
		try {
			ctx.session.blunt_ref = ctx?.update?.message?.text.toLowerCase();
			const {
				data
			} = await axios.post<any>(
				"http://localhost:3000/api/blunt/nft", {
				accountId: ctx.session.blunt_ref,
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			let seriesId = 0;
			if (ctx.session.selectStick == "blunt") {
				seriesId = 1;
			} else if (ctx.session.selectStick == "spliff") {
				seriesId = 2;
			} else if (ctx.session.selectStick == "joint") {
				seriesId = 3;
			}
			if (data?.nft["nft.bluntdao.near"]?.length > 0) {
				await ctx.replyWithHTML(
					`<b>✅ Your OG Exist .Please wait to claim Blunt Dao NFT</b>`,
				);
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				console.log("ctx.session.accountId", ctx.session.accountId)
				const res = await axios.post(
					"http://localhost:3000/api/blunt/mint", {
					seriesId: seriesId,
					accountId: ctx.session.accountId,
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				console.log("res", res)
				const tokenId = Date.now() + ""

				const resNFT = await axios.post(
					"http://localhost:3000/api/nft/mint", {
					title: `BluntDao NFT #${ctx.session.selectStick}`,
					description: `${ctx?.update?.message?.text} @bluntdao.near #ProofOfSesh #BluntDAO #${ctx.session.selectStick}`,
					cid: ctx.session.cid,
					privateKey: ctx.session.privateKey,
					accountId: ctx.session.accountId,
					receiverNFT: ctx.session.accountId,
					tokenId: `bluntdao.${ctx.session.selectStick}.${tokenId}`
				}, {
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
				);
				await ctx.deleteMessage(message_id);

				if (res) {
					ctx.session.proofofsesh = true;
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const res = await axios.post(
						"http://localhost:3000/api/social/post", {
						cid: ctx.session.cid,
						privateKey: ctx.session.privateKey,
						accountId: ctx.session.accountId,
						content: `Just got onboard with a ${ctx.session.selectStick.toUpperCase()} by @${ctx.session.blunt_ref} via #ProofOfSesh to #BluntDAO @bluntdao.near Now I'm an #OGValidator, sesh with me IRL to get onboarded`,
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					if (res.data.result?.transaction_outcome?.outcome?.status) {

						await ctx.deleteMessage(message_id);
						const {
							data
						} = await axios.post<any>(
							"http://localhost:3000/api/blunt/nft", {
							accountId: ctx.session.accountId,
						}, {
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
							},
						}
						);
						console.log("data", JSON.stringify(data))
						if (data?.nft["nft.bluntdao.near"]?.length > 0) {
							await ctx.replyWithHTML(
								`<b>✅ YOU ARE IN BLUNT DAO. YOU ARE AN OG VALIDATOR. NOW YOU CAN ONBOARD OTHERS TO BLUNT DAO THE SAME WAY. YOU ARE AN OG VALIDATOR.\nYOU HAVE A NFT (<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${data.nft["nft.bluntdao.near"][0].nft_contract_id}&tokenId=${data.nft["nft.bluntdao.near"][0].token_id}">Open</a>) AND YOU ALREADY POSTED ON WEB3 SOCIAL (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">Open</a>) 🔥🎉</b>`,keyboards.back()
							);
						}

						await axios.post<any>(
							"http://localhost:3000/api/blunt/add", {
							seriesId: ctx.session.selectStick,
							accountId: ctx.session.accountId,
							privateKey: ctx.session.privateKey,
							nonce: res.data.result.transaction.nonce
						}, {
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
							},
						}
						);
					}

					await axios.post<any>(
						"http://localhost:3000/api/blunt/follow", {
						accountId: ctx.session.accountId,
						privateKey: ctx.session.privateKey
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
				}
				return next();
			} else {
				await ctx.replyWithHTML(
					`<b>❌ AN OG WITH THIS WALLET DOESNT EXIST.\n\nPLEASE TYPE AGAIN</b>`, keyboards.back()
				);
			}
		} catch (error) {
			console.log(error)
		}
	}
    async editMessageText(ctx, ...message) {
		try {
			return await ctx.replyWithHTML(...message);
		} catch (err) {
			return null;
		}
	}
}
module.exports = {
    BotTest
};