const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {


    beforeEach(async function() {
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    describe('can create a star', () => {
        let defaultUser = accounts[0]
        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = '032.155'
        let dec = '121.874'
        let mag = '245.978'
        let starId = 1
        let tx

        beforeEach(async function() {
          tx = await this.contract.createStar(name, story, cent, dec, mag, starId, {from: defaultUser})
        })

        it('can set owner to defaultUser', async function() {
            assert.equal(tx.logs[0].args.to, defaultUser)
        })

        it('can map starId with defaultUser', async function() {
            assert.equal(await this.contract.ownerOf(starId), defaultUser)
        })

        it('can create a star and get its info', async function () {
            let result = await this.contract.tokenIdToStarInfo(starId)
            let concat_cent = 'ra_032.155'
            let concat_dec = 'dec_121.874'
            let concat_mag = 'mag_245.978'

            assert.equal(result[0], name)
            assert.equal(result[1], story)
            assert.equal(result[2], concat_cent)
            assert.equal(result[3], concat_dec)
            assert.equal(result[4], concat_mag)
        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = '032.155'
        let dec = '121.874'
        let mag = '245.978'
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

    describe('can approve', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let operator = accounts[3]

        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = '032.155'
        let dec = '121.874'
        let mag = '245.978'
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(name, story, cent, dec, mag, starId, {from: user1})

            await this.contract.approve(user2, starId, {from: user1})
            await this.contract.setApprovalForAll(operator, true, {from: user1})
        })

        it('user1 can approve user2', async function() {
          assert.equal(await this.contract.getApproved(starId), user2)
        })

        it('user1 can set all approval of address he owns for operator', async function() {
          assert.equal(await this.contract.isApprovedForAll(user1, operator), true)
        })
    })

    describe('can check if a star already exists or not', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let operator = accounts[3]

        let name = 'Star power 103!'
        let story = 'I love my wonderful star'
        let cent = '032.155'
        let dec = '121.874'
        let mag = '245.978'
        let starId = 1

        it('return false if no star has been registered', async function() {
          assert.equal(await this.contract.checkIfStarExist(cent, dec, mag), false)
        })

        it('return true if the star has been registered', async function() {
          await this.contract.createStar(name, story, cent, dec, mag, starId)

          let concat_cent = "ra_" + cent
          let concat_dec = "dec_" + dec
          let concat_mag = "mag_" + mag

          assert.equal(await this.contract.checkIfStarExist(concat_cent, concat_dec, concat_mag), true)
        })
    })
})
