const {expect} = require('chai');
const {ethers} = require('hardhat');

describe('Market' , function () {
    let cusdt, cnft, market, account1, account2;

    beforeEach(async () => { 
        [account1, account2] = await ethers.getSigners();

        let cUSDT = await ethers.getContractFactory('cUSDT');
        cusdt = await cUSDT.deploy();

        let cNFT = await ethers.getContractFactory('cNFT');
        cnft = await cNFT.deploy(account1.address);

        let NftMarket = await ethers.getContractFactory('NftMarket');
        market = await NftMarket.deploy(cusdt.target, cnft.target);

        await cnft.safeMint(account2.address);
        await cnft.safeMint(account2.address);
        await cusdt.approve(market.target, "100000000000000000000000000");
    });

    it('market init', async function () {
        expect(await market.cUSDT()).to.equal(cusdt.target);
        expect(await market.cNFT()).to.equal(cnft.target);
    });

    it('account1 should have cusdt', async function () {
        expect(await cusdt.balanceOf(account1.address)).to.equal("100000000000000000000000000");

    });

    it('account2 should have 2 nfts', async function () {
        expect(await cnft.balanceOf(account2.address)).to.equal(2);

    });

    it('account2 can list 2 nfts to marke', async function () {
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";

        expect(await cnft.connect(account2)['safeTransferFrom(address, address, uint256, bytes)'](account2.address, market.target, 0, price)).to.emit(market, "NewOrder");
        expect(await cnft.connect(account2)['safeTransferFrom(address, address, uint256, bytes)'](account2.address, market.target, 1, price)).to.emit(market, "NewOrder");

        expect(await cnft.balanceOf(account2.address)).to.equal(0);
        expect(await cnft.balanceOf(market.target)).to.equal(2);

    });
});