pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        string cent;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function mint(address _to, uint256 _tokenId) internal {
      _mint(_to, _tokenId);
    }

    function createStar(string _name, string _story, string _cent, string _dec, string _mag, uint256 _tokenId) public {
        Star memory newStar = Star(_name, _story, _cent, _dec, _mag);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    /* function checkIfStarExist() {} */
    /* function approve() {} */
    /* function safeTransferFrom() {} */
    /* function SetApprovalForAll() {} */
    /* function getApproved() {} */
    /* function isApprovedForAll() {} */

    /* function ownerOf(uint256 _tokenId) public view returns (address) {
      return ownerOf(_tokenId);
    } */

    /* function starsForSale() {} */
    /* function tokenIdToStarInfo() {} */
}
