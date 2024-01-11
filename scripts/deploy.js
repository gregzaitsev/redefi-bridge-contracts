require('dotenv').config();
require('colors');
const { ethers } = require("hardhat");

// const ethers = require('ethers');
const fs = require('fs');
// const hre = require("hardhat");
const testnet = process.env.TESTNET === "1";
const symbol = process.env.SYMBOL;

const configFile = __dirname + '/../src/config/networks' + (testnet ? '.testnet' : '') + '.json';
console.log('pp: ', process.env['NODE_TLS_REJECT_UNAUTHORIZED']);
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const networks = require(configFile);
async function main() {
	const peggingTokens = [];
	{ // collecting token list
		const _tokens = {};
		for (let chain in networks) {
			if (chain !== symbol) {
				_tokens[chain] = true;
				for (let k in networks[chain].tokens) {
					if (k !== symbol) {
						_tokens[k] = true;
					}
				}
			}
		}
		for (let k in _tokens) peggingTokens.push(k);
	}

	const admin = process.env.ADMIN_PUBKEY;
	console.log(ethers);

	const signer = await ethers.getSigner();
	console.log(`Starting ${symbol} deploy by ${signer.address.yellow}`);
	const Bridge = await ethers.getContractFactory("Bridge");
	const bridge = await Bridge.deploy(admin);
	console.log('bridge', bridge);

	await bridge.deployed();
	console.log('Bridge ' + bridge.address);

	const tokens = {};
	for (let k of peggingTokens) {
		const Token = await ethers.getContractFactory('Token');
		const decimals = 18;
		const label = "Pegged " + k;
		const token = await Token.deploy(label, k, 18, bridge.address, 0);
		await token.deployed();
		console.log(label + ' ' + token.address);
		tokens[k] = {
			label,
			contract: token.address,
			decimals,
			pegging: true
		};
	}
	// const tx2 =
	const addrs = Object.values(tokens).map(i => i.contract);
	console.log(addrs);
	await bridge.addTokens(addrs);
	// await tx2.wait()

	fs.writeFileSync(configFile, JSON.stringify({
		...networks,
		[symbol]: {
			...networks[symbol],
			bridge: bridge.address,
			tokens: {
				...networks[symbol].tokens,
				...tokens
			}
		}
	}, null, '\t'));
	console.log('contract deploy completed');
}

main().then(() => {
}).catch((error) => {
	console.error(error);
	process.exit(1);
});
