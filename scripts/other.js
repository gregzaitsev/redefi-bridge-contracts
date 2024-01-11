require('dotenv').config();
require('colors');
const fs = require('fs');
const testnet = process.env.TESTNET==="1"
const configFile = __dirname + '/../src/config/networks' + (testnet ? '.testnet' : '') + '.json'
const networks = require(configFile);
const ZeroAddress = '0x0000000000000000000000000000000000000000'

const admin = process.env.ADMIN_PUBKEY;

// const other = async (chain) => {
// 	const signer = await ethers.getSigner();

// 	console.log('Starting ' + chain + ' deploy by ', signer.address.yellow);
// 	const Bridge = await ethers.getContractFactory("Bridge");
// 	const bridge = await Bridge.deploy(admin);
// 	await bridge.deployed();
// 	console.log('Bridge ' + bridge.address);

// 	const tokens = {};
// 	// const peggings = [];
// 	for (let k in networks[chain].tokens) {
// 		const t = networks[chain].tokens[k];
// 		if (t.pegging || t.fake) {
// 			const Token = await ethers.getContractFactory('Token');
// 			// const decimals = 18;
// 			const token = await Token.deploy(t.label, k, t.decimals, t.pegging ? bridge.address : ZeroAddress, t.fake ? 1e4 : 0);
// 			await token.deployed();
// 			console.log(t.label + ' ' + token.address);
// 			// if (t.pegging) {
// 				// peggings.push(token.address);
// 			// }
// 			tokens[k] = {
// 				...t,
// 				// label: t.label,
// 				contract: token.address,
// 				// decimals
// 			};
// 			// if (t.pegging) tokens[k].pegging = true
// 			// if (t.fake) tokens[k].fake = true
// 		}
// 	}
// 	const addrs = Object.values(tokens).map(i=>i.contract);
// 	console.log(addrs);
// 	const tx = await bridge.addTokens(addrs);
// 	await tx.wait();

// 	fs.writeFileSync(configFile, JSON.stringify({
// 		...networks, 
// 		[chain]: {
// 			...networks[chain],
// 			bridge: bridge.address,
// 			tokens: {
// 				...networks[chain].tokens,
// 				...tokens
// 			}
// 		}
// 	}, null, 4));
// }


const other1 = async (chain) => {
	const signer = await ethers.getSigner();
	console.log(signer.address);
	// const abi = require('../artifacts/contracts/Bridge.sol/Bridge.json');
	const abi = ["function addTokens(address[] memory tokens) external"];

	const bridge = new ethers.Contract(networks[chain].bridge, abi, signer);
	// console.log(bridge);
	const addrs = Object.values(networks[chain].tokens).map(i=>i.contract);
	
	console.log(addrs);
	const tx = await bridge.addTokens(addrs);
	await tx.wait();
	console.log("token adding done");
}

module.exports = other1


