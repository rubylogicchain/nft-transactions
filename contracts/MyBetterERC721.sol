// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyBetterERC721 is ERC721, Ownable {
    using Counters for Counters.Counter;

    struct BuyRequest {
        address buyer;
        uint256 price;
        uint8 commission;
    }

    Counters.Counter private _tokenIds;

    // Mapping from token ID to address for commission
    mapping(uint256 => address[]) private _commissionAddresses;

    // Mapping from token ID to mapping from address to commission
    mapping(uint256 => mapping(address => uint8)) private _commissions;

    // Mapping from token ID to BuyRequest(buyer address and price)
    mapping(uint256 => BuyRequest[]) private _buyRequests;

    constructor() public ERC721("MyBetterERC721", "MYBETTERERC721") {}

    function mint(
        address to,
        string memory value,
        uint8 commission
    ) public onlyOwner returns (uint256) {
        require(
            commission >= 0 && commission < 100,
            "commission has to be between 0..100"
        );

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();

        _mint(to, newId);
        _setTokenURI(newId, value);
        _commissionAddresses[newId].push(to);
        _commissions[newId][to] = commission;

        return newId;
    }

    function requestBuy(uint256 tokenId, uint8 commission) public payable {
        // TODO: require tokenId exists!!!
        // TODO: require _msgSender doesnt own the token
        _buyRequests[tokenId].push(
            BuyRequest({
                buyer: msg.sender,
                price: msg.value,
                commission: commission
            })
        );

        payable(address(this)).transfer(msg.value);
    }

    function sell(
        address payable from,
        address to,
        uint256 tokenId
    ) public {
        BuyRequest memory buyRequest = _findBuyRequest(tokenId, to);
        transferFrom(from, to, tokenId);

        uint256 priceLeft = buyRequest.price;
        for (uint256 i = 0; i < _commissionAddresses[tokenId].length; ++i) {
            address commissionReceiver = _commissionAddresses[tokenId][i];

            if (commissionReceiver == from) {
                continue;
            }

            uint8 commissionRate = _commissions[tokenId][commissionReceiver];
            uint256 commission = (priceLeft * commissionRate) / 100;
            address payable receiverWalet = payable(commissionReceiver);
            receiverWalet.transfer(commission);
            priceLeft -= commission;
        }

        from.transfer(priceLeft);

        _commissionAddresses[tokenId].push(to);
        _commissions[tokenId][to] = buyRequest.commission;

        for (uint256 i = 0; i < _buyRequests[tokenId].length; ++i) {
            if (_buyRequests[tokenId][i].buyer == to) {
                continue;
            }

            address payable buyer = payable(_buyRequests[tokenId][i].buyer);
            buyer.transfer(_buyRequests[tokenId][i].price);
        }

        delete _buyRequests[tokenId];
    }

    // TODO: remove this later
    function getBuyRequestsLength(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return _buyRequests[tokenId].length;
    }

    function getValue(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function getCommission(address user, uint256 tokenId)
        public
        view
        returns (uint8)
    {
        require(_exists(tokenId), "tokenId doesnt exist");
        // TypeError: Operator != not compatible with types uint8 and address payable
        // require(_commissions[tokenId][user] != address(0), "address doesnt exist");

        return _commissions[tokenId][user];
    }

    function getBuyRequests(uint256 tokenId)
        public
        view
        returns (BuyRequest[] memory)
    {
        return _buyRequests[tokenId];
    }

    receive() external payable {
        //
    }

    fallback() external payable {
        //
    }

    function _findBuyRequest(uint256 tokenId, address buyer)
        private
        view
        returns (BuyRequest memory)
    {
        bool found = false;
        BuyRequest memory buyRequest;

        for (uint256 i = 0; i < _buyRequests[tokenId].length; ++i) {
            if (_buyRequests[tokenId][i].buyer == buyer) {
                found = true;
                buyRequest = _buyRequests[tokenId][i];
            }
        }

        require(found == true, "No buy request found for this address");
        return buyRequest;
    }
}
