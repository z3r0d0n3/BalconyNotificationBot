require("dotenv").config()

const { ethers, constants } = require("ethers");
const { Client, Intents } = require('discord.js');
const Twit = require('twit');

// var T = new Twit({
//     consumer_key:         '...',
//     consumer_secret:      '...',
//     access_token:         '...',
//     access_token_secret:  '...',
//     timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
//     strictSSL:            true,     // optional - requires SSL certificates to be valid.
//   })

let provider = new ethers.providers.InfuraProvider("rinkeby", process.env.INFURA);  // homestead -> mainnet
provider = ethers.providers.InfuraProvider.getWebSocketProvider("rinkeby", process.env.INFURA); // homestead -> mainnet

let abi = ["event DeedMinted(uint DeedId, address DeedOwner, uint DeedLevel)"]
let contract = new ethers.Contract(process.env.DEED, abi, provider) // 0x2baa69ce1b565276afccc85cc30c9b7a6f00f4d2 mainnet

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

contract.on("DeedMinted", (DeedId, DeedOwner, DeedLevel) => {
    let message = "Deed #" + DeedId.toString() + " minted by " + DeedOwner + "!"
    client.channels.cache.get('949086510420987904').send(message);
    // T.post('statuses/update', { status: message }, function(err, data, response) {
    //     console.log(data)
    // })
});

client.login(process.env.BOT_TOKEN);
