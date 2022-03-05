require("dotenv").config()

const { ethers, constants } = require("ethers");
const { Client, Intents } = require('discord.js');
// const Twit = require('twit');

// var T = new Twit({
//     consumer_key:         '...',
//     consumer_secret:      '...',
//     access_token:         '...',
//     access_token_secret:  '...',
//     timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
//     strictSSL:            true,     // optional - requires SSL certificates to be valid.
//   })

// let provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA);  // homestead -> mainnet
let provider = ethers.providers.InfuraProvider.getWebSocketProvider("homestead", process.env.INFURA); // homestead -> mainnet

let abi2 = [{
    "anonymous": false,
    "name": "DeedMinted",
    "inputs": [
        {
            "internalType": "uint256",
            "type": "uint256",
            "indexed": false,
            "name": "DeedId"
        },
        {
            "name": "DeedOwner",
            "internalType": "address",
            "indexed": false,
            "type": "address"
        },
        {
            "internalType": "uint256",
            "type": "uint256",
            "name": "DeedLevel",
            "indexed": false
        }
    ],
    "type": "event"
}]

let contract = new ethers.Contract(process.env.DEED, abi2, provider) // 0x2Baa69Ce1b565276AfcCc85CC30C9B7a6F00F4D2 mainnet
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// client.on('ready', () => {
// 	console.log(`Logged in as ${client.user.tag}!`);
// });

contract.on("DeedMinted", (DeedId, DeedOwner, DeedLevel) => {
    let message = "Deed #" + DeedId.toString() + " minted by " + DeedOwner + "!"
    console.log(message)
    client.channels.cache.get(process.env.CHAT_ID.toString()).send(message);
    // T.post('statuses/update', { status: message }, function(err, data, response) {
    //     console.log(data)
    // })
});

client.login(process.env.BOT_TOKEN);
