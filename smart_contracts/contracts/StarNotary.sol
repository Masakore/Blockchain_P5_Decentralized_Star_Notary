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

    mapping(uint256 => Star) private _tokenIdToStarInfo;
    mapping(uint256 => uint256) private _starsForSale;
    Star[] public _starsInUse;

    function mint(address _to, uint256 _tokenId) internal {
      _mint(_to, _tokenId);
    }

    function createStar(string _name, string _story, string _cent, string _dec, string _mag, uint256 _tokenId) public returns (string) {
        require(_tokenId > 0);

        string memory concat_cent = string(abi.encodePacked("ra_", _cent));
        string memory concat_dec = string(abi.encodePacked("dec_", _dec));
        string memory concat_mag = string(abi.encodePacked("mag_", _mag));

        Star memory newStar = Star(_name, _story, concat_cent, concat_dec, concat_mag);

        require(!checkIfStarExist(concat_cent, concat_dec, concat_mag), "This Star is already exists!");

        _tokenIdToStarInfo[_tokenId] = newStar;
        _starsInUse.push(newStar);

        // Todo how to test if transfer failed?
        mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        _starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(_starsForSale[_tokenId] > 0);

        uint256 starCost = _starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExist(string _cent, string _dec, string _mag) public view returns (bool){
        if (_starsInUse.length == 0) {
          return false;
        }

        for (uint i = 0; i < _starsInUse.length; i++) {
          Star storage existingStars = _starsInUse[i];

          string memory cent_in_use = string(existingStars.cent);
          string memory dec_in_use = string(existingStars.dec);
          string memory mag_in_use = string(existingStars.mag);

          if (hashCompareWithLengthCheck(cent_in_use, _cent) && hashCompareWithLengthCheck(dec_in_use, _dec) && hashCompareWithLengthCheck(mag_in_use, _mag)) {
            return true;
          }
        }
        return false;
    }

    function hashCompareWithLengthCheck(string a, string b) internal returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(a) == keccak256(b);
        }
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public {
        ERC721.safeTransferFrom(_from, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) public {
      ERC721.approve(_to, _tokenId);
    }

    function setApprovalForAll(address _to, bool _approved) public {
      ERC721.setApprovalForAll(_to, _approved);
    }

    function getApproved(uint256 _tokenId) public view returns (address) {
      return ERC721.getApproved(_tokenId);
    }

    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
      return ERC721.isApprovedForAll(_owner, _operator);
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        return ERC721.ownerOf(_tokenId);
    }

    function starsForSale(uint256 _tokenId) public view returns (uint256) {
        return _starsForSale[_tokenId];
    }

    function tokenIdToStarInfo(uint256 _tokenId) public view returns (string, string, string, string, string){
        Star memory starInfo = _tokenIdToStarInfo[_tokenId];
        return (starInfo.name, starInfo.story, starInfo.cent, starInfo.dec, starInfo.mag);
    }
}
