const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {


    beforeEach(async function() {
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    contract('can create a star', () => {
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

            let star_should_be = [name, story, concat_cent, concat_dec, concat_mag]

            assert.deepEqual(result, star_should_be)
        })

        it('transaction will be reverted if you try to register a duplicated starId', async function () {
            let name2 = 'Good star'
            let story2 = 'Found this star while looking up sky'
            let cent2 = '032.021'
            let dec2 = '120.390'
            let mag2 = '123.339'

            try {
              await this.contract.createStar(name2, story2, cent2, dec2, mag2, starId, {from: defaultUser})
            } catch(err) {
              assert.equal(err.message, "VM Exception while processing transaction: revert")
            }
        })

        it('transaction will be reverted if you try to register a starId equals to zero', async function() {
            let name2 = 'Good star'
            let story2 = 'Found this star while looking up sky'
            let cent2 = '032.021'
            let dec2 = '120.390'
            let mag2 = '123.339'

            try {
                await this.contract.createStar(name2, story2, cent2, dec2, mag2, 0, {from: defaultUser})
            } catch(err) {
                assert.equal(err.message, "VM Exception while processing transaction: revert")
            }
        })

        it('cannot register the same geometric star', async function() {
            try {
                await this.contract.createStar(name, story, cent, dec, mag, starId, {from: defaultUser})
            } catch(err) {
                assert.equal(err.message, "VM Exception while processing transaction: revert This Star is already exists!")
            }
        })
    })

    contract('buying and selling stars', () => {
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

        contract('user2 can buy a star that was put up for sale', () => {
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

    contract('can approve', () => {
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
})
