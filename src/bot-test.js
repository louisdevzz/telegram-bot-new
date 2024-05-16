const {
	Composer,
	Context,
	Markup,
	Scenes,
    session,
}=require("telegraf");
const Telegraf = require("telegraf");
const axios =require("axios");
const dotenv=require("dotenv");
const RedisSession = require('telegraf-session-redis');
const keyboards = require("./keyboards");
const { encodeSignedDelegate } = require("@near-js/transactions");
const { 
	CreateAccount, 
	getState,
	CheckBalance, 
	getNFT, 
	uploadIPFS, 
	syncProfile, 
	transferToken, 
	getVibe, mintNFT, 
	postSocial, 
	getNFTBlunt, 
	mintBlunt, 
	addBlunt,
	submitTransaction,
	followBlunt,
	transferNFT
} = require("../utils/SDK");


dotenv.config();
const API_TOKEN = process.env.BOT_TOKEN;
if (API_TOKEN === undefined) {
	throw new TypeError("BOT_TOKEN must be provided!");
}
const redissession = new RedisSession({
    store: {
        host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
        port: process.env.TELEGRAM_SESSION_PORT || 6379
    },
});

class BotTest{
    constructor(logger){
        this.bot = new Telegraf(API_TOKEN);
        this.logger = logger;
        
		this.bot.use(redissession);
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
        const commands = [
            ['start',this.start],
            ['createwallet', this.createwallet],
			['proofofsesh',this.proofofsesh],
			['transfertoken',this.showTransferToken],
			['transfernft',this.showTransferToken],
			['mintnft', this.mint_nft],
			['postnearsocial',this.postnearsocial],
			['setting',this.setting],
			['sync',this.sync],
            ['clear', this.helper]
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
            ['transfertoken', this.showTransferToken],
            ['transfernft', this.transfernft],
			['max', this.max],
			['send', this.sendNFT],
			[/^selecttoken_(.+)$/, this.getselecttoken],
			[/^selectnftcollection_(.+)$/, this.getSelectNFTCollection],
			[/^selectnft_(.+)$/, this.getSelectNFT],
			[/^rateEnegery_(.+)$/, this.getRateEnegery],
			[/^rateFriendliness_(.+)$/, this.getRateFriendliness],
			[/^rateDensity_(.+)$/, this.getRateDensity],
			[/^rateDiversity_(.+)$/, this.getRateDiversity],
			[/^selectStick_(.+)$/, this.proofOfSesh],
			[/^select_(.+)$/, this.getSelect],
			['postnearsocial',this.postnearsocial],
			['post',this.post],
			['proofofsesh',this.proofofsesh],
			['blank',this.blank],
			['logout',this.logout],
			['action_logout',this.actionLogout],
			['helper', this.helper],
            ['setting', this.setting],
            ['export', this.export]
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
	async setSession(key,value,ctx){
		redissession.saveSession(key,value)
		ctx.session[key] = value;
	}
	async getSession(key,ctx){
		return await redissession.getSession(key)||ctx.session[key];
	}
    async handleBot(ctx) {
        console.log("photo",ctx.update?.message?.photo)
        console.log("text",ctx.update?.message?.text)
		console.log("action:",await redissession.getSession("action"))
		const action = ctx.session.action||await redissession.getSession("action")
        if(ctx.update?.message?.text){
			if(!ctx.match[0].startsWith("/")){
				if (action) {
					switch (action) {
						case 'createwallet':
							this.createwallet(ctx);
							this.setSession("action",null,ctx);
							break;
						case 'mintvibecontent':
							this.mintvibecontent(ctx);
							this.setSession("action",null,ctx);
							break;
						case 'uploadipfs':
							this.mintnft(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'mintNFTmyself':
							this.mintNFTMyself(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'mintnftsuccess':
							this.mintNFTSuccess(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'postnearsocial':
							this.postNearSocial(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'getselect':
							this.postProofOfSeshFinal(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'amount':
							this.transfertoken(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'address':
							this.transferOfTokenSucess(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'transferNFTSuccess':
							this.transferNFTSuccess(ctx);
							this.setSession("action",null,ctx);
							break;			
						default:
							this.setSession("action",null,ctx);
					}
				}
			}
		}else{
			if(ctx.update?.message?.photo){
				if (action) {
					switch (action) {
						case 'mintvibe':
							this.mintvibe(ctx);
							this.setSession("action",null,ctx);
							break;
						case 'mint_nft':
							this.uploadIPFS(ctx);
							this.setSession("action",null,ctx);
							break;	
						case 'postnearsocialfinal':
							this.postNearSocialFinal(ctx);
							this.setSession("action",null,ctx);
							break;
						case 'proofofsesh':
							this.proofOfSeshFinal(ctx);
							this.setSession("action",null,ctx);
							break;	
						default:
							this.setSession("action",null,ctx);
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
		ctx.session.action = 'postnearsocial';
		await ctx.replyWithHTML(
			"<b>Send message to create a post on NEAR SOCIAL (hyperlinking + formatting supported)</b>", keyboards.back()
		);
	}
	async proofofsesh(ctx){
		this.setSession("action","proofofsesh",ctx);
		if (ctx?.update?.message?.text == process.env.PROOF_OF_SESH) {
			await ctx.replyWithHTML("<b>✅ Correct Password. Watchu smoking on???</b>", keyboards.proofofsesh());
		}
		const proofofsesh = await redissession.getSession("proofofsesh");
		if (proofofsesh) {
			await ctx.replyWithHTML("<b>✅ YOU ALREADY IN BLUNT DAO SILLY.Learn more at bluntdao.org</b>", keyboards.back());
			await ctx.replyWithHTML(`<b>📸Take a picture of the smoking stick</b>`, keyboards.home());
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
			const stateAccount = await getState(newAccount);
			//console.log(stateAccount)
			if (stateAccount.response?.type == "AccountDoesNotExist") {
				const {signedDelegates,privateKey,seed} = await CreateAccount(newAccount.toLowerCase())
				//console.log(signedDelegates)
				try {
					
					const {data} = await axios.post(
							"http://localhost:5000/relay", {
							delegate: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegates))),
						}, {
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
							},
						}
					);
					console.log(data)
					if (data.final_execution_status == "FINAL") {
						ctx.session.privateKey = privateKey;
						ctx.session.user_telegram = ctx.update?.message?.chat?.username;
						ctx.session.accountId = newAccount.toLowerCase();
						redissession.saveSession("privatekey", privateKey);
						//const res = await fetch(`${process.env.TELE_APP_DOMAIN}/storage?accountId=${newAccount.toLowerCase()}&&privateKey=${privateKey}`)
						redissession.saveSession("accountId", newAccount);
						//console.log("res",res)
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
				if (stateAccount.response?.type == "REQUEST_VALIDATION_ERROR") {
					await ctx.deleteMessage(message_id);
					await ctx.replyWithHTML(
						`<b>❌${newAccount.toLowerCase()} is not valid!</b>\nsend another address`, keyboards.back()
					);
				}
			}
			if (stateAccount.response.amount) {
				await ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(
					`<b>❌${newAccount.toLowerCase()} is taken!</b>\nsend another address`, keyboards.back()
				);
			}
		}
    }
    async checkbalance(ctx) {
        const {
            message_id
        } = await ctx.replyWithHTML(
            `<b>Loading...</b>`
        );
        try {
			const accountId = await redissession.getSession("accountId")
            const tokenList = await CheckBalance(accountId);
			console.log("token",tokenList)
            let totalUSD = 0;
            tokenList.forEach((item) => {
                totalUSD += parseFloat(item.balanceInUsd);
            });
            let balanceMes =
                "<b>" +
                accountId +
                " balance</b>\n\n💰 Money (" +
                totalUSD +
                " USD)\n----------------------------------\n";
            tokenList.forEach((item) => {
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
            } = await getNFT(accountId);
            
			console.log("data: ",data)
            if(Object.keys(data).length > 0){
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
                            url: `https://near.social/genadrop.near/widget/GenaDrop.Profile.Main?accountId=${accountId}`,
                        },],
                        [{
                            text: "📚 Open Transaction History",
                            url: `https://nearblocks.io/address/${accountId}`,
                        },],
                        [{
                            text: "⏪ Back",
                            callback_data: "helper",
                        },],
                    ],
                },
            });
			}else{
				await ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(balanceMes);
				await ctx.replyWithHTML("🖼️ Not Found NFT In Account",keyboards.back());
			}
        } catch (error) {
            if (error.response?.data?.error?.message) {
                await ctx.reply(error.response?.data?.error?.message);
            } else {
                await ctx.replyWithHTML("<b>❌ Error</b>");
            }
        }
    }
	async transfernft(ctx){
		try {
			const accountId = await redissession.getSession("accountId");
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const {
				data
			} = await getNFT(accountId)
			let totalNft = 0;
			let balanceMes = "<b>choose collection to send</b>\n\n";
			const contractOwnedList = Object.keys(data.nft);
			this.setSession("nftOwned",data.nft,ctx);
			let nftColelctionSelect = [];
			contractOwnedList.forEach((item, index) => {

				nftColelctionSelect.push([{
					text: `${data.nft[item][index].nft_contract_name}`,
					callback_data: `selectnftcollection_${item}`,
				},]);
			});
			let nftList = "";
			contractOwnedList.forEach((item, index) => {
				totalNft += data.nft[item].length;
				nftList +=
					`${data.nft[item][index].nft_contract_name
						? data.nft[item][index].nft_contract_name
						: "Unknow Title"
					} (${data.nft[item].length})` +
					`..<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${data.nft[item][index].nft_contract_id}&tokenId=${data.nft[item][index].token_id}&chainState=near">Open</a>\n`;
			});
			balanceMes +=
				"\n🖼️ NFTs (" +
				totalNft +
				" NFT)\n----------------------------------\n";
			balanceMes += nftList;

			nftColelctionSelect.push([{
				text: "⏪ Back",
				callback_data: "back",
			},]);
			await ctx.deleteMessage(message_id);
			await ctx.replyWithHTML(balanceMes, {
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: nftColelctionSelect,
				},
			});
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", {
				reply_markup: {
					inline_keyboard: [
						[{
							text: "⏪ Back",
							callback_data: "back",
						},],
					],
				},
			});
		}
	}
	async getSelectNFTCollection(ctx){
		let nftCollection = null;
		if (ctx.match[1]) {
			nftCollection = ctx.match[1];
			this.setSession("selectNftCollection",nftCollection,ctx);
			try {
				let nftSelect = [];
				const nftOwned = await redissession.getSession("nftOwned");
				let nftListMess = `<b>choose collection to send</b>\n\n${nftOwned[nftCollection][0].nft_contract_name}  (${nftOwned[nftCollection].length})..<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${nftOwned[nftCollection][0].nft_contract_id}&tokenId=${nftOwned[nftCollection][0].token_id}&chainState=near">Open</a>\n\n`;
				nftOwned[nftCollection].forEach((item) => {
					nftListMess += `${item.title}..<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${item.nft_contract_id}&tokenId=${item.token_id}&chainState=near">Open</a>\n`;
					nftSelect.push([
						Markup.callbackButton(`${item.title}`,`selectnft_${item.token_id}`)
					]);
				});
				nftSelect.push([{
					text: "⏪ Back",
					callback_data: "back",
				},]);
				await ctx.replyWithHTML(nftListMess, Markup.inlineKeyboard(nftSelect).extra());
			} catch (error) {
				await ctx.replyWithHTML("<b>❌ Error</b>"+error, keyboards.back());
			}
		}
	}
	async getSelectNFT(ctx){
		if (ctx.match[1]) {
			const nft_token_id = ctx.match[1];
			this.setSession("selectNft",nft_token_id,ctx);
			const selectNft = await redissession.getSession("selectNft");
			let nftselect = null;
			const nftOwned = await redissession.getSession("nftOwned");
			const selectNftCollection = await redissession.getSession("selectNftCollection");
			nftOwned[selectNftCollection].forEach((item) => {
				if (item.token_id == selectNft) {
					nftselect = item;
				}
			});
			await ctx.replyWithHTML(
				`<b>Type in a receiver address\nYou are sending ${nftselect.title} <a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${nftselect.nft_contract_id}&tokenId=${nftselect.token_id}&chainState=near">Open</a></b>`, keyboards.back()
			);
			this.setSession("action","transferNFTSuccess",ctx);
		}
	}
	async transferNFTSuccess(ctx){
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>Loading...</b>`
		);
		const accountId = await redissession.getSession("accountId");
		const stateAccount = await getState(accountId);
		await ctx.deleteMessage(message_id);
		var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
		if (!format.test(ctx.update?.message?.text.toLowerCase())) {
			await ctx.replyWithHTML(`<b>❌ Error not a valid Near address.</b>`, keyboards.back());
		}
		if (
			stateAccount.response?.type == "AccountDoesNotExist" ||
			stateAccount.response.type == "REQUEST_VALIDATION_ERROR"
		) {
			await ctx.replyWithHTML(
				`<b>❌ this address does not exist. try again</b>`, keyboards.back()
			);
		}

		if (stateAccount.response.amount) {
			const receiverNFT = ctx.update?.message?.text.toLowerCase();
			const nftOwned = await redissession.getSession("nftOwned");
			const selectNftCollection = await redissession.getSession("selectNftCollection");
			const selectNft = await redissession.getSession("selectNft");
			this.setSession("receiverNFT",receiverNFT,ctx);
			let nftselect = null;
			nftOwned[selectNftCollection].forEach(
				(item) => {
					if (item.token_id == selectNft) {
						nftselect = item;
					}
				}
			);
			await ctx.replyWithHTML(
				`<b>✅ You are sending ${nftselect.title} (<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${nftselect.nft_contract_id}&tokenId=${nftselect.token_id}&chainState=near">Open of ${nftselect.nft_contract_name}) to ${ctx.update?.message?.text}</a>  <a href="">Open Profile</a></b>`, keyboards.transferNFT()
			);
		}
	}
	async sendNFT(ctx){
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>Loading...</b>`
		);
		const accountId = await redissession.getSession("accountId");
		const privateKey = await redissession.getSession("privatekey");
		const receiverNFT = await redissession.getSession("receiverNFT");
		const selectNft = await redissession.getSession("selectNft");
		const selectNftCollection = await redissession.getSession("selectNftCollection");
		const signedDelegate = await transferNFT(privateKey,accountId,receiverNFT,selectNft,selectNftCollection)
		const data = await submitTransaction(signedDelegate);
		await ctx.deleteMessage(message_id);
		if (data.transaction_outcome.outcome.status) {
			await ctx.replyWithHTML(`<b>✅ Success </b>`, keyboards.home());
		} else {
			await ctx.replyWithHTML(`<b>❌ Error cannt transfer. try again</b>`, keyboards.home());
		}
	}
    async helper(ctx){
		const privateKey = await redissession.getSession("privatekey").then((session) => session);
		const accountId = await redissession.getSession("accountId").then((session) => session);
		if (ctx.session.privateKey || privateKey && ctx.session.accountId || accountId) {
			return this.editMessageText(ctx,`<b>${ctx.session.accountId || accountId}</b>\nyou are logged in. Click button to use your wallet`, keyboards.helper())
		} else {
			return this.create_wallet(ctx);
		}
	}
	async actionLogout(ctx){
		await ctx.replyWithHTML(
			`<b>✅ you are logout</b>\n\nif you did not export your key than we cannot make you a new wallet`, keyboards.home()	
		);
		this.setSession("privatekey",null,ctx);
		this.setSession("accountId",null,ctx);
		this.setSession("selecttoken",null,ctx);
		this.setSession("selectNftCollection",null,ctx);
		this.setSession("nftOwned",null,ctx);
		this.setSession("postContent",null,ctx);
		this.setSession("postImage",null,ctx);
		this.setSession("selectNft",null,ctx);
		this.setSession("titleNFT",null,ctx);
		this.setSession("tokenContract",null,ctx);
		this.setSession("descriptionNFT",null,ctx);
		this.setSession("amountTransfertoken",null,ctx);
		this.setSession("reveicerToken",null,ctx);
		this.setSession("selectEnegry",null,ctx);
		this.setSession("selectFriendliness",null,ctx);
		this.setSession("selectDiversity",null,ctx);
		this.setSession("selectDensity",null,ctx);
		this.setSession("proofofsesh",null,ctx);
		this.setSession("selectStick",null,ctx);
		this.setSession("blunt_ref",null,ctx);
		this.setSession("cid",null,ctx);
		return this.helper(ctx);
	}
	async logout(ctx){
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
				const accountId = await redissession.getSession("accountId").then((session) => session)||ctx.session.accountId;
				const tokenList = await CheckBalance(accountId);
				let totalUSD = 0;
				tokenList.forEach((item) => {
					totalUSD += parseFloat(item.balanceInUsd);
				});
				let balanceMes =
					"<b>" +
					accountId +
					" balance</b>\n\n💰 Money (" +
					totalUSD +
					" USD)\n----------------------------------\n";
				tokenList.forEach((item) => {
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
				} = await getNFT(accountId)
				if(data && Object.keys(data).length > 0){
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
				}else{
					await ctx.deleteMessage(message_id);
					await ctx.replyWithHTML(balanceMes);
					await ctx.replyWithHTML("🖼️ Not Found NFT In Account",keyboards.transferOfToken());
				}
			} catch (error) {
				if (error.response?.data.error?.message) {
					await ctx.reply(error.response?.data?.error?.message);
				} else {
					await ctx.replyWithHTML(`<b>❌ Error</b> ${error}`);
				}
			}
	}
	async sync(ctx){
		const profile = await ctx.telegram.getChat(ctx.update.message.chat.id)
		const big_file = await ctx.telegram.getFileLink(profile.photo.big_file_id);
		const profileName = profile.last_name ? profile.first_name + " " + profile.last_name : profile.first_name;
		const accountId = await redissession.getSession("accountId");
		const privateKey = await redissession.getSession("privatekey");
		try {
			const {
				data
			} = await uploadIPFS(big_file)
			const signedDelegate = await syncProfile(
				accountId,
				privateKey,
				profile.username,
				profileName,
				profile.bio,
				data.cid,
				""
			) 
			await axios.post(
				"http://localhost:5000/relay", {
				delegate: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate)))
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			await ctx.replyWithHTML(
				`<b>✅ Synchronization with account completed <a href="https://near.social/mob.near/widget/ProfilePage?accountId=${accountId}">Open</a></b>`
			);
		} catch (error) {
			await ctx.replyWithHTML(`<b>❌ Error.</b>`, keyboards.back());
		}
	
	}
	async max(ctx){
		try {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const accountId = await redissession.getSession("accountId");
			const selecttoken = await redissession.getSession("selecttoken");
			const tokenList = await CheckBalance(accountId);
			tokenList.forEach((element) => {
				if (element.symbol == selecttoken) {
					this.setSession("amountTransfertoken",element.balance,ctx);
					this.setSession("tokenContract",element.contract,ctx);
					this.setSession("decimals",element.decimals.toString(),ctx);
				}
			});
			await ctx.deleteMessage(message_id);
			this.setSession("action","address",ctx);
			const amountTransfertoken = await redissession.getSession("amountTransfertoken");
			await ctx.replyWithHTML(
				`🔂 <b>Sending ${amountTransfertoken} ${selecttoken}</b>.\n\nType in a NEAR address to send FT token`, keyboards.back()
			);
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
		}
	}
	async getselecttoken(ctx,next){
		const token = ctx.match[1];
		this.setSession("selecttoken",token,ctx);
		try {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const accountId = await redissession.getSession("accountId");
			const tokenList = await CheckBalance(accountId);
			let totalUSD = 0;
			tokenList.forEach((item) => {
				totalUSD += parseFloat(item.balanceInUsd);
			});
			let balanceMes =
				"<b>Type Amount or Put Max amount of Near you want to end\n\nYou have</b>\n----------------------------------\n";
			this.setSession("action","amount",ctx);
			tokenList.forEach((item) => {
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
	async showTransferToken(ctx){
		try {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const accountId = await redissession.getSession("accountId");
			const tokenList = await CheckBalance(accountId);
			let totalUSD = 0;
			tokenList.forEach((item) => {
				totalUSD += parseFloat(item.balanceInUsd);
			});
			let balanceMes =
				"<b>" +
				accountId +
				" balance</b>\n\n💰 Money (" +
				totalUSD +
				" USD)\n----------------------------------\n";
			tokenList.forEach((item) => {
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
			tokenList.forEach((item) => {
				tokenListSend.push([
					Markup.callbackButton(`${item.symbol}`,`selecttoken_${item.symbol}`)
				]);
			});
			tokenListSend.push([Markup.callbackButton("⏪ Back","helper")]);
			console.log(tokenListSend)
			ctx.deleteMessage(message_id);
			await ctx.replyWithHTML(balanceMes, Markup.inlineKeyboard(tokenListSend).extra());
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>");
		}
	}
	async transfertoken(ctx){
		let amountToken = "";
		if (ctx.update?.message?.text[0] == ".") {
			amountToken = "0" + ctx.update?.message?.text
		} else {
			amountToken = ctx.update?.message?.text;
		}
		const accountId = await redissession.getSession("accountId");
		const selecttoken = await redissession.getSession("selecttoken");
		if (/^-?\d+\.?\d*$/.test(amountToken)) {
			try {
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				
				const tokenList = await CheckBalance(accountId);
				
				let isEnoughAmount = false;
				tokenList.forEach((element) => {
					if (element.symbol == selecttoken) {
						if (amountToken <= element.balance) {
							this.setSession("tokenContract",element.contract,ctx);
							this.setSession("decimals",element.decimals,ctx);
							isEnoughAmount = true;
						}
					}
				});
				if (isEnoughAmount) {
					this.setSession("amountTransfertoken",amountToken,ctx);
					await ctx.deleteMessage(message_id);
					this.setSession("action","address",ctx);
					await ctx.replyWithHTML(
						`✅Sending ${amountToken} ${selecttoken} . Type in NEAR address to send`, keyboards.back()
					);
				} else {
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const tokenList = await CheckBalance(accountId);
					let totalUSD = 0;
					tokenList.forEach((item) => {
						totalUSD += parseFloat(item.balanceInUsd);
					});
					this.setSession("action","amount",ctx);
					const amountTransfertoken = await redissession.getSession("amountTransfertoken");
					let balanceMes = `<b>❌ You do not have ${amountTransfertoken} ${selecttoken}, try again\n\nType Amount or Put Max amount of Near you want to end\n\nYou have</b>\n----------------------------------\n`;
					for (const item of tokenList) {
						if (item.symbol == selecttoken) {
							const textLength =
								(item.balance + " " + item.symbol).length * 3;
							const lengthDot = 50 - textLength;
							let dot = "";
							for (let index = 0; index < lengthDot; index++) {
								dot += ".";
							}
							balanceMes +=
								item.balance +
								" " +
								item.symbol +
								dot +
								item.balanceInUsd +
								` USD\n`;
						}
					}
					await ctx.deleteMessage(message_id);
					await ctx.replyWithHTML(balanceMes);
				}
			} catch (error) {
				await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.back());
			}
		} else {
			try {
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				const tokenList = await CheckBalance(accountId);
				let totalUSD = 0;
				tokenList.forEach((item) => {
					totalUSD += parseFloat(item.balanceInUsd);
				});
				let balanceMes =
					"<b>❌ Only numbers allowed,try again\n\nType Amount or Put Max amount of Near you want to end\n\nYou have</b>\n----------------------------------\n";
				tokenList.forEach((item) => {
					if (item.symbol == ctx.session.selecttoken) {
						const textLength =
							(item.balance + " " + item.symbol).length * 3;
						const lengthDot = 50 - textLength;
						let dot = "";
						for (let index = 0; index < lengthDot; index++) {
							dot += ".";
						}
						balanceMes +=
							item.balance +
							" " +
							item.symbol +
							dot +
							item.balanceInUsd +
							` USD\n`;
					}
				});
				this.setSession("action","amount",ctx);
				await ctx.deleteMessage(message_id);
				await ctx.replyWithHTML(balanceMes, keyboards.back());
			} catch (error) {
				await ctx.replyWithHTML("<b>❌ Got some errors, try again</b>",keyboards.back());
			}
		}
	}
	async transferOfTokenSucess(ctx){
		console.log("transferOfTokenSucess")
		try {
			var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
			if (!format.test(ctx.update?.message?.text.toLowerCase())) {
				await ctx.replyWithHTML(`<b>❌ Error not a valid Near address.</b>`, keyboards.back());

			} else {
				const accountId = await redissession.getSession("accountId");
				const stateAccount = await getState(accountId);
				console.log("stateAccount: ",stateAccount)
				if (
					stateAccount?.response?.type == "AccountDoesNotExist" ||
					stateAccount?.response?.type == "REQUEST_VALIDATION_ERROR"
				) {
					await ctx.replyWithHTML(
						`<b>❌ this address does not exist. try again</b>`, keyboards.back()
					);
				}
				this.setSession("reveicerToken",ctx.update?.message?.text.toLowerCase(),ctx);
				if (stateAccount?.response?.amount) {
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const amountTransfertoken = await redissession.getSession("amountTransfertoken");
					const decimals = await redissession.getSession("decimals");
					const privateKey = await redissession.getSession("privatekey");
					const reveicerToken = await redissession.getSession("reveicerToken");
					const tokenContract = await redissession.getSession("tokenContract");
					console.log("tokenContract",tokenContract)
					console.log("decimals",decimals)
					const amount = (
						amountTransfertoken *
						Math.pow(10, decimals)
					).toLocaleString("fullwide", {
						useGrouping: false
					}) + "";
					console.log("amount",amount)
					const signedDelegate = await transferToken(
						privateKey,
						accountId,
						reveicerToken,
						amount,
						tokenContract
						);
					console.log("signedDelegate",signedDelegate)
					const {
						data
					} = await axios.post(
						`http://localhost:5000/relay`, {
						delegate: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate)))
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					console.log("data: ",data)
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
	async setting(ctx){
		const accountId = await redissession.getSession("accountId");
		//console.log(`${process.env.TELE_APP_DOMAIN}/storage?accountId=${accountId}&privateKey=${privateKey}`);
		await ctx.replyWithHTML(
			`<b>${accountId}</b>\n\nManager your wallet here\nOnce you sign out we will not make another on your behalf to prevent from bots`, {
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[{
						text: "🔑 Export your keys",
						callback_data: "export",
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
	async export(ctx){
		const privateKey = await redissession.getSession("privatekey");
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>🔑 Keys: ${privateKey}</b>`
		);
		const clearchat = setInterval(function () {
			ctx.deleteMessage(message_id)
			clearInterval(clearchat); 
		}, 5000);	
	}
	async mintvibe(ctx){
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
				} = await uploadIPFS(fileUrl)
				console.log("ipfs: ",data)
				this.setSession("cid",data.cid,ctx);
				if (data.cid) {
					redissession.saveSession("action","mintvibecontent")
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
	async blank(ctx){
		ctx.session.content = "";
		await ctx.replyWithHTML(
				`<b>Rate the ⚡️energy (was the vibe calm or very active) with 10 being the most active</b>`, keyboards.mintvibeBlank()
		);
	}
	async autogenerate(ctx){
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
	async mintvibecontent(ctx){
		ctx.session.content = ctx.update?.message?.text;
		await ctx.replyWithHTML(
			`<b>Rate the ⚡️energy (was the vibe calm or very active) with 10 being the most active</b>`, keyboards.mintvibeBlank()
		);
	}
	async getRateEnegery(ctx){
		const rate = ctx.match[1];
		this.setSession("selectEnegry",rate,ctx);
		await ctx.replyWithHTML(
			`You selected <b>${rate}</b>⚡️for energy`
		);
		await ctx.replyWithHTML(
			`<b>Rate the ❤️ friendliness (how friendly was people) with 10 being the most friendly</b>`, keyboards.getRateEnegery()
		);
	}
	async getRateFriendliness(ctx){
		const rate = ctx.match[1];
		this.setSession("selectFriendliness",rate,ctx);
		await ctx.replyWithHTML(
			`You selected <b>${rate}</b> ❤️ for friendliness`
		);
		await ctx.replyWithHTML(
			`<b>Rate the 🧊 density (were you were alone or was the vibe packed) with 10 being the most backed</b>`, keyboards.getRateFriendliness()
		);
	}
	async getRateDensity(ctx){
		const rate = ctx.match[1];
		this.setSession("selectDensity",rate,ctx);
		await ctx.replyWithHTML(
			`You selected <b>${rate}</b> 🧊 for density`
		);
		await ctx.replyWithHTML(
			`<b>Rate the 🌈 diversity (was the vibe full of the same type of people or was the culture diverse) with 10 being the most diverse</b>`, keyboards.getRateDensity()
		);
	}
	async getRateDiversity(ctx){
		if (!ctx.session.selectDiversity || await redissession.getSession("selectDiversity")) {
			const rate = ctx.match[1];
			this.setSession("selectDiversity",rate,ctx)
			await ctx.replyWithHTML(
				`You selected <b>${rate}</b> 🌈 for diversity`
			);
			return this.mintVibeSuccess(ctx);
		}
		
	}
	async mintVibeSuccess(ctx){
		const selectEnegry = ctx.session.selectEnegry || await redissession.getSession("selectEnegry");
		const selectFriendliness = ctx.session.selectFriendliness || redissession.getSession("selectFriendliness");
		const selectDensity = ctx.session.selectDensity || await redissession.getSession("selectDensity");
		const selectDiversity = ctx.session.selectDiversity || await redissession.getSession("selectDiversity");
		const cid = ctx.session.cid || await redissession.getSession("cid");
		console.log("cid: ",cid)
		if (selectEnegry&&selectFriendliness&&selectDensity&&selectDiversity&&cid) {
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const accountId = ctx.session.accountId || await redissession.getSession("accountId");
			const privateKey = ctx.session.privateKey || await redissession.getSession("privatekey");
			const content = ctx.session.content || await redissession.getSession("content") || "";
			const signedDelegate = await getVibe(
				accountId,
				cid,
				privateKey,
				selectFriendliness,
				selectEnegry,
				selectDensity,
				selectDiversity,
				content
			)
			const {data} = await axios.post(
				"http://localhost:5000/relay", {
				delegate: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate)))
			}, {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
			);
			await ctx.deleteMessage(message_id);
			if (data.transaction_outcome?.outcome?.status) {
				await ctx.replyWithHTML(
					`<b>✅ You successfully posted on NEAR Social for vibes. <a href="https://near.social/mob.near/widget/MainPage.Post.Page?accountId=${accountId}&blockHeight=${data.transaction.nonce}">(See link)</a>\n⌛️ The image will take ~10 minutes to show on NEAR Social </b>`, keyboards.home()
				);
				const tokenId = Date.now() + "";
				const title = `${accountId.replace(".near", "")} ${new Date().toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}`;
				const description = `#ProofOfVibes #   @proofofvibes.near ${content} \n ## **Vibe-rating**  ❤️ **Friendliness:** ${selectFriendliness}/10 ⚡️ **Energy:** ${selectEnegry}/10 🧊 **Density:** ${selectDensity}/10 🌈 **Diversity:** ${selectDensity}/10`;
				const signedDelegate = await mintNFT(
					accountId,
					title,
					description,
					cid,
					privateKey,
					accountId,
					tokenId
				)
				await axios.post(
					"http://localhost:5000/relay", {
					delegate: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate)))
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
	async uploadIPFS(ctx){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				this.setSession("fileUrl",fileUrl,ctx);
				const {
					data
				} = await uploadIPFS(fileUrl);
				if (data.cid) {
					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\n Type in Your title for your NFT (Max 20 character), no links or special characters</b>`, keyboards.back()
					);
					this.setSession("cid",data.cid,ctx);
					this.setSession("action","uploadipfs",ctx);
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
	async mintnft(ctx){
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
				const titleNFT = ctx.update?.message?.text;
				await ctx.replyWithHTML(
					`<b>✅ Successfully titled NFT "${titleNFT}"\n\nAdd description,max 200 characters.Links allowed.</b>`, keyboards.mintnft()
				);
				this.setSession("action","mintnftsuccess",ctx)
				this.setSession("titleNFT",ctx.update?.message?.text,ctx);
			}
		}
	}
	async mintNFTAutogeneration(ctx){
		try {
			const fileUrl = ctx.session.fileUrl || await redissession.getSession("fileUrl");
			const description = await axios.post<any>(
				"https://api.openai.com/v1/chat/completions", {
				model: "gpt-3.5-turbo",
				messages: [{
					role: "user",
					content: `write a caption post to twitter ${fileUrl}`,
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
				this.setSession("descriptionNFT",description.data.choices[0].message.content,ctx);
				const titleNFT = ctx.session.titleNFT || await redissession.getSession("titleNFT");
				await ctx.replyWithHTML(
					`<b>✅ Successfully put description\n\nNow who are you minting your "${titleNFT}" NFT to?\n\n</b>Enter valid Near Account`,keyboards.mintNFTmyself()
				);
				return ctx.next();
			}
		} catch (error) {
			console.log(error)
			await ctx.replyWithHTML("<b>❌ Error</b>", keyboards.mintNFTmyself());
		}
	}
	async mintNFTBlank(ctx,next){
		this.setSession("descriptionNFT","",ctx);
		const titleNFT = await redissession.getSession("titleNFT");
		await ctx.replyWithHTML(
			`<b>✅ Successfully put description\n\nNow who are you minting your "${titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
		);
		return next();
	}
	async mintNFTError(ctx){
		await ctx.replyWithHTML(
			"<b>❌ Error description title too long\n\n Add description, max 200 characters.Links allowed.</b>", keyboards.mintnft()
		);
	}
	async mintNFTSuccess(ctx){
		if(ctx.update?.message?.text.length > 200){
			return this.mintNFTError(ctx);
		}
		const descriptionNFT = ctx.update?.message?.text;
		console.log("descriptionNFT",descriptionNFT)
		this.setSession("descriptionNFT", descriptionNFT,ctx);
		const titleNFT = await redissession.getSession("titleNFT");
		this.setSession("action", "mintNFTMyself",ctx);
		return await ctx.replyWithHTML(
			`<b>✅ Successfully put description\n\nNow who are you minting your "${titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
		);
	}
	async mintNFTMyself(ctx){
		let receiverNFT = null;
		const accountId = await redissession.getSession("accountId");
		console.log("ctx.match: ",ctx.match);
		if (ctx.match == "mintNFTmyself") {
			this.setSession("receiverNFT",accountId,ctx);
			receiverNFT = accountId;
		} else {
			receiverNFT = ctx.update?.message?.text?.toLowerCase();
		}
		const titleNFT = await redissession.getSession("titleNFT");
		const descriptionNFT =  await redissession.getSession("descriptionNFT");
		const privateKey =  await redissession.getSession("privatekey");
		const cid = await redissession.getSession("cid");
		try {
			var format = /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/g;
			if (!format.test(receiverNFT)) {
				await ctx.replyWithHTML(
					`<b>❌ Error not a valid Near address.\n\nNow who are you minting your "${titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
				);
			} else {
				const stateAccount = await getState(accountId);
				if (stateAccount.response?.amount) {
					this.setSession("receiverNFT",ctx.update?.message?.text.toLowerCase(),ctx);
					const tokenId = Date.now() + "";
					const {
						message_id
					} = await ctx.replyWithHTML(
						`<b>Loading...</b>`
					);
					const signedDelegate = await mintNFT(
						accountId,
						titleNFT,
						descriptionNFT,
						cid,
						privateKey,
						receiverNFT,
						tokenId
					)
					const {data} = await axios.post(
						"http://localhost:5000/relay", {
						delegate:JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate)))
					}, {
						headers: {
							"Content-Type": "application/json",
							Accept: "application/json",
						},
					}
					);
					if (
						data.transaction_outcome?.outcome?.status
							?.SuccessReceiptId
					) {
						await ctx.deleteMessage(message_id);
						return await ctx.replyWithHTML(
							`<b>✅You successfully minted "${titleNFT}" NFT to user <a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=nft.genadrop.near&tokenId=${tokenId}&chainState=near">(Open)</a></b>`, keyboards.home()
						);
					}
				}
				if (
					stateAccount.response?.type == "AccountDoesNotExist" ||
					stateAccount.response?.type == "REQUEST_VALIDATION_ERROR"
				) {
					await ctx.replyWithHTML(
						`<b>❌ Error this near doesnt exists.\n\nNow who are you minting your "${titleNFT}" NFT to?\n\n</b>Enter valid Near Account`, keyboards.mintNFTmyself()
					);
				}
			}
		} catch (error) {
			await ctx.replyWithHTML("<b>❌ Error</b>",keyboards.back());
		}
	}
	async postNearSocial(ctx){
		await ctx.replyWithHTML("<b>Upload Image to Post . Supported file types;png;gif;jpeg (max 10mb) Send a picture</b>",keyboards.postnearsoical());
		this.setSession("action","postnearsocialfinal",ctx);
		this.setSession("postContent",ctx?.update?.message?.text,ctx);
	}
	async post(ctx){
		const {
			message_id
		} = await ctx.replyWithHTML(
			`<b>Loading...</b>`
		);
		const accountId = await redissession.getSession("accountId");
		const privateKey = await redissession.getSession("privatekey");
		const postContent = await redissession.getSession("postContent");
		const signedDelegate = await postSocial(
			accountId,
			null,
			privateKey,
			postContent
		)
		const data = await submitTransaction(signedDelegate);
		await ctx.deleteMessage(message_id);
		if (data.transaction_outcome?.outcome?.status) {
			return await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${accountId}&blockHeight=${data.transaction.nonce}">Open</a>) </b>`,keyboards.home());
		}
	}
	async postNearSocialFinal(ctx){
		try {
			if (ctx.update.message?.photo) {
				const {
					message_id
				} = await ctx.replyWithHTML(
					`<b>Loading...</b>`
				);
				const {
					file_id
				} = ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				const {
					data
				} = await uploadIPFS(fileUrl);
				const accountId =  await redissession.getSession("accountId");
				const privateKey = await redissession.getSession("privatekey");
				const postContent = await redissession.getSession("postContent");
				if (data.cid) {
					const cid = data.cid;
					const value = await postSocial(
						accountId,
						cid,
						privateKey,
						postContent
					);
					//console.log("value:",value)
					const result = await submitTransaction(value);
					console.log(result)
					await ctx.deleteMessage(message_id);
					if (result.transaction_outcome?.outcome?.status) {
						return await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${accountId}&blockHeight=${result.transaction.nonce}">Open</a>) </b>`,keyboards.home());
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
			await ctx.replyWithHTML("<b>❌ Error</b>"+error, keyboards.back());
		}
	}
	async proofOfSesh(ctx){
		const selectStick = ctx.match[1];
		this.setSession("selectStick",selectStick,ctx);
		this.setSession("action","proofofsesh",ctx);
		await ctx.replyWithHTML(`<b>YOU HAVE CHOSEN ${selectStick.toUpperCase()}</b>`);
		await ctx.replyWithHTML(`<b>📸Take a picture of the smoking stick</b>`, keyboards.back());
	}
	async proofOfSeshFinal(ctx){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} = ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				this.setSession("fileUrl",fileUrl,ctx)
				const {
					data
				} = await uploadIPFS(fileUrl);
				if (data.cid) {
					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\nSend a message to say what you feel</b>`, keyboards.back()
					);
					this.setSession("cid",data.cid,ctx)
					const proofofsesh = ctx.session.proofofsesh || await redissession.getSession("proofofsesh");
					if (proofofsesh) {
						await ctx.replyWithHTML("<b> Watchu smoking on???</b>", keyboards.proofofseshfinal());
					} else {
						await ctx.replyWithHTML(
							`<b>WHO REFERED YOU. PUT THEIR .NEAR handle / telegram handle or name</b>`, keyboards.back()
						);
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
	async getSelect(ctx){
		const selectStick = ctx.match[1];
		this.setSession("selectStick",selectStick,ctx);
		this.setSession("action","getselect",ctx);
		await ctx.replyWithHTML(
			`<b>✅ YOU HAVE CHOSEN ${selectStick.toUpperCase()}\n\nSend a message to say what you feel</b>`, keyboards.back()
		);
	}
	async getAllSelect(ctx){
		try {
			if (ctx.update.message?.photo) {
				const {
					file_id
				} =
					ctx.update.message.photo[ctx.update.message.photo.length - 1];
				const fileUrl = await ctx.telegram.getFileLink(file_id);
				this.setSession("fileUrl",fileUrl,ctx);
				const {
					data
				} = await uploadIPFS(fileUrl);
				if (data.cid) {
					
					await ctx.replyWithHTML(
						`<b>✅🗂️ File Successfully Uploaded to IPFS <a href="https://gateway.pinata.cloud/ipfs/${data.cid}">(open ipfs link)</a>\n\nSend a message to say what you feel</b>`,keyboards.back()
					);
					this.setSession("cid",data.cid,ctx);
					const proofofsesh = ctx.session.proofofsesh || await redissession.getSession("proofofsesh")
					if (!proofofsesh) {
						await ctx.replyWithHTML(
							`<b>WHO REFERED YOU. PUT THEIR .NEAR handle / telegram handle or name</b>`,keyboards.home()
						);
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
	async postProofOfSeshFinal(ctx){
		const proofofsesh = await redissession.getSession("proofofsesh");
		if(ctx?.update?.message?.text && proofofsesh){
			const {
				message_id
			} = await ctx.replyWithHTML(
				`<b>Loading...</b>`
			);
			const contents = ctx?.update?.message?.text + "\n@bluntdao.near #ProofOfSesh #BluntDAO";
			const accountId = await redissession.getSession("accountId");
			const cid = await redissession.getSession("cid");
			const privateKey = await redissession.getSession("privatekey");
			const signedDelegate = await postSocial(
				accountId,
				cid,
				privateKey,
				contents
			)
			const data = await submitTransaction(signedDelegate);
			await ctx.deleteMessage(message_id);
			if (data.transaction_outcome?.outcome?.status) {
				await ctx.replyWithHTML(`<b>✅ You posted on NEAR Social (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${accountId}&blockHeight=${data.transaction.nonce}">Open</a>) </b>`, keyboards.back());
				const tokenId = Date.now() + "";
				const selectStick = ctx.session.selectStick || await redissession.getSession("selectStick");
				const title = `BluntDao NFT #${selectStick}`;
				const description = `${ctx?.update?.message?.text} @bluntdao.near #ProofOfSesh #BluntDAO #${selectStick}`;
				const token_id = `bluntdao.${selectStick}.${tokenId}`;
				const signedDelegates = await mintNFT(
					accountId,
					title,
					description,
					privateKey,
					accountId,
					token_id
				)
				await submitTransaction(signedDelegates)
			}
		}
		if(ctx?.update?.message?.text){
			try {
				this.setSession("blunt_ref",ctx?.update?.message?.text.toLowerCase(),ctx);
				const accountId = await redissession.getSession("accountId");
				const selectStick = await redissession.getSession("selectStick");
				const {
					data
				} = await getNFTBlunt(accountId)
				let seriesId = 0;
				if (selectStick == "blunt") {
					seriesId = 1;
				} else if (selectStick == "spliff") {
					seriesId = 2;
				} else if (selectStick == "joint") {
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
					console.log("ctx.session.accountId", accountId)
					const signedDelegate = await mintBlunt(accountId,seriesId);
					const data = await submitTransaction(signedDelegate);
					console.log("res", data)
					const tokenId = Date.now() + "";
					const title = `BluntDao NFT #${selectStick}`;
					const cid = await redissession.getSession("cid");
					const privateKey = await redissession.getSession("privatekey");
					const description = `${ctx?.update?.message?.text} @bluntdao.near #ProofOfSesh #BluntDAO #${selectStick}`;
					const token_id = `bluntdao.${selectStick}.${tokenId}`;
					const signedDelegateMint = await mintNFT(
						accountId,
						title,
						description,
						cid,
						privateKey,
						accountId,
						token_id
					)
					await submitTransaction(signedDelegateMint)
					await ctx.deleteMessage(message_id);
					const proofofsesh = await redissession.getSession("proofofsesh");
					const blunt_ref = await redissession.getSession("blunt_ref");
					if (data) {
						proofofsesh = true;
						const {
							message_id
						} = await ctx.replyWithHTML(
							`<b>Loading...</b>`
						);
						const content = `Just got onboard with a ${selectStick.toUpperCase()} by @${blunt_ref} via #ProofOfSesh to #BluntDAO @bluntdao.near Now I'm an #OGValidator, sesh with me IRL to get onboarded`
						const delegate =  await postSocial(
							accountId,
							cid,
							privateKey,
							content
						)
						const data = await submitTransaction(delegate);
						if (data.transaction_outcome?.outcome?.status) {
	
							await ctx.deleteMessage(message_id);
							const {
								data
							} = await getNFTBlunt(accountId)
							console.log("data", JSON.stringify(data))
							if (data?.nft["nft.bluntdao.near"]?.length > 0) {
								await ctx.replyWithHTML(
									`<b>✅ YOU ARE IN BLUNT DAO. YOU ARE AN OG VALIDATOR. NOW YOU CAN ONBOARD OTHERS TO BLUNT DAO THE SAME WAY. YOU ARE AN OG VALIDATOR.\nYOU HAVE A NFT (<a href="https://near.social/agwaze.near/widget/GenaDrop.NFTDetails?contractId=${data.nft["nft.bluntdao.near"][0].nft_contract_id}&tokenId=${data.nft["nft.bluntdao.near"][0].token_id}">Open</a>) AND YOU ALREADY POSTED ON WEB3 SOCIAL (<a href="https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=${ctx.session.accountId}&blockHeight=${res.data.result.transaction.nonce}">Open</a>) 🔥🎉</b>`,keyboards.back()
								);
							}
							const addDelegate = await addBlunt(
								accountId,
								selectStick,
								privateKey,
								data.transaction.nonce
							)
							await submitTransaction(addDelegate)
						}
						const followDelegate = await followBlunt(
							accountId,
							privateKey
						)
						await submitTransaction(followDelegate);
					}
				} else {
					await ctx.replyWithHTML(
						`<b>❌ AN OG WITH THIS WALLET DOESNT EXIST.\n\nPLEASE TYPE AGAIN</b>`, keyboards.back()
					);
				}
			} catch (error) {
				console.log(error)
			}
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