pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import 'ethereum-libraries-string-utils/contracts/StringUtilsLib.sol';

contract StarNotary is ERC721 {
    using StringUtilsLib for *;

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

    function createStar(string _name, string _story, string _cent, string _dec, string _mag, uint256 _tokenId) public {
        string memory concat_cent = string(abi.encodePacked("cent_", _cent));
        string memory concat_dec = string(abi.encodePacked("dec_", _dec));
        string memory concat_mag = string(abi.encodePacked("mag_", _mag));

        Star memory newStar = Star(_name, _story, concat_cent, concat_dec, concat_mag);

        checkIfStarExist(concat_cent, concat_dec, concat_mag);

        _tokenIdToStarInfo[_tokenId] = newStar;
        _starsInUse.push(newStar);

        _mint(msg.sender, _tokenId);
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
          Star memory existingStars = _starsInUse[i];
          /* if (abi.encodePacked(string(existingStars.cent)) == abi.encodePacked(_cent) && string(existingStars.dec) == _dec && string(existingStars.mag) == _mag) { */
          if (StringUtilsLib.equals(existingStars.cent.toSlice(), _cent.toSlice())) {
            return true;
          }
        }
        return false;
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
