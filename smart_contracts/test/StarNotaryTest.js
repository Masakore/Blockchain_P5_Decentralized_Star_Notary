const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {


    beforeEach(async function() {
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    describe('can create a star', () => {
        let defaultUser = accounts[0]
        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = 'ra_032.155'
        let dec = 'dec_121.874'
        let mag = 'mag_245.978'
        let starId = 1
        let tx

        beforeEach(async function() {
          tx = await this.contract.createStar(name, story, cent, dec, mag, starId, {from: defaultUser})
        })

        it('can set owner to defaultUser', async function() {
            assert.equal(tx.logs[0].args.to, defaultUser)
        })

        it('can create a star and get its name', async function () {
            let result = await this.contract.tokenIdToStarInfo(starId)

            assert.equal(result[0], name)
        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = 'ra_032.155'
        let dec = 'dec_121.874'
        let mag = 'mag_245.978'
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(name, story, cent, dec, mag, starId, {from: user1})
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })
})
