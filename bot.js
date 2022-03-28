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

let newAbi = [{
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "Referer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "DeedOwner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "DeedLevel",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "DeedPoints",
            "type": "uint256"
          }
        ],
        "name": "NewDeed",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "deedIndex",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "addressToDeed",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "level",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "points",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "DeedOwner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "DeedLevel",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "DeedPoints",
            "type": "uint256"
          }
        ],
        "name": "UpdateDeed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
    ]

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const EXPECTED_PONG_BACK = 15000
const KEEP_ALIVE_CHECK_INTERVAL = 7500

const startConnection = async () => {
  // let provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA);  // homestead -> mainnet
  // let wsprovider = ethers.providers.InfuraProvider.getWebSocketProvider("homestead", process.env.INFURA); // homestead -> mainnet
  let provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
  let wsprovider = new ethers.providers.WebSocketProvider("http://localhost:8545")
  let contract = new ethers.Contract(process.env.NEW_DEED, newAbi, provider);
  let wscontract = new ethers.Contract(process.env.NEW_DEED, newAbi, wsprovider);
  
  // provider.resetEventsBlock(14355774)
  // wsprovider.resetEventsBlock(14355774)

  let pingTimeout = null
  let keepAliveInterval = null

  const filter1 = wscontract.filters.NewDeed()
  const filter2 = wscontract.filters.Transfer()
  
  const events = await contract.queryFilter({
    address: process.env.NEW_DEED,
    topics: filter1.topics.concat(filter2.topics)
  }, 14379229, "latest")

  const logs = await provider.getLogs({
    fromBlock: 14379229,
    toBlock: 'latest',
    address: process.env.NEW_DEED,
    topic: filter1.topics.concat(filter2.topics)
  })

  for (let log of logs) {
    ev = contract.interface.parseLog(log)
    if (ev) {
      if (ev.name === "Transfer") {
        await new Promise(r => setTimeout(r, 2500));
        if (ev.args.from === ethers.constants.AddressZero) {
          let msg = "\nDeed #" + ev.args.tokenId.toString() + " minted by " + ev.args.to + "!"
          console.log(msg)
          client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
        }
      }

      if (ev.name === "NewDeed") {
        if (ev.args.Referer === ethers.constants.AddressZero) {
          if (ev.args.DeedPoints.gt(1)) {
            let msg = "Owner: " + ev.args.DeedOwner + " (+2pts)"
            console.log(msg)
            client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
          } else {
            let msg = "Owner: " + ev.args.DeedOwner + " (+1pt)"
            console.log(msg)
            client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
          }
        } else {
          let msg = "Owner: " + ev.args.DeedOwner + " : Referred by " + ev.args.Referer + " (+2pts, +3pts)"
          console.log(msg)
          client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
        }
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

    wscontract.on(events, (ev) => {
      if (ev) {
        if (ev.event === "Transfer") {
          if (ev.args.from === ethers.constants.AddressZero) {
            let msg = "Deed #" + ev.args.tokenId.toString() + " minted by " + ev.args.to + "!"
            console.log(msg)
            // client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
          }
        }

        if (ev.event === "NewDeed") {
          if (ev.args.Referer === ethers.constants.AddressZero) {
            if (ev.args.DeedPoints.gt(1)) {
              let msg = "Owner: " + ev.args.DeedOwner + " (+2pts)"
              console.log(msg)
              // client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
            } else {
              let msg = "Owner: " + ev.args.DeedOwner + " (+1pt)"
              console.log(msg)
              // client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
            }
          } else {
            let msg = "Owner: " + ev.args.DeedOwner + " : Referred by " + ev.args.Referer + " (+2pts, +3pts)"
            console.log(msg)
            // client.channels.cache.get(process.env.CHAT_ID.toString()).send(msg);
          }
        }
      }
    })

    keepAliveInterval = setInterval(() => {
      console.log('Checking if the connection is alive, sending a ping')
      wsprovider._websocket.ping()
      pingTimeout = setTimeout(() => {
        wsprovider._websocket.terminate()
      }, EXPECTED_PONG_BACK)
    }, KEEP_ALIVE_CHECK_INTERVAL)    

    wsprovider._websocket.on('close', () => {
        console.log('The websocket connection was closed')
        clearInterval(keepAliveInterval)
        clearTimeout(pingTimeout)
        startConnection()
    })

    wsprovider._websocket.on('pong', () => {
        console.log('Received pong, so connection is alive, clearing the timeout')
        clearInterval(pingTimeout)
    })
}

startConnection()

client.login(process.env.BOT_TOKEN);
