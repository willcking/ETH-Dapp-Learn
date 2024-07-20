//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./INftMarketData.sol";

contract NftMarket is INftMarketData {

    IERC20 public cUSDT;
    IERC721 public cNFT;

    Order[] public orders;

    mapping(uint256 => Order) public orderOfId; // tokenId to Order
    mapping(uint256 => uint256) public idToIndex; // tokenId to index in orders

    event Deal(address seller, address buyer, address recipient, uint256 tokenId, uint256 price);
    event NewOrder(address seller, uint256 tokenId, uint256 price);
    event PriceChanged(address seller, uint256 tokenId, uint256 previousPrice, uint256 newPrice);
    event OrderCancelled(address seller, uint256 tokenId);

    constructor(address _cUSDT, address _cNFT) {

        require(_cUSDT != address(0) && _cNFT != address(0), "zero address");

        cUSDT = IERC20(_cUSDT);
        cNFT = IERC721(_cNFT);
    }

    function buy(uint256 _tokenId, address recipient) external {
        Order memory order = orderOfId[_tokenId];
        address seller = order.seller;
        uint256 price = order.price;

        require(cUSDT.transferFrom(msg.sender, seller, price), "transfer fail");
        cNFT.transferFrom(address(this), recipient, _tokenId);

        removeOrder(_tokenId);

        emit Deal(seller, msg.sender, recipient, _tokenId, price);
    }

    function cancelOrder(uint256 _tokenId) external {
        address seller = orderOfId[_tokenId].seller;
        require(msg.sender == seller, "not nft owner");

        cNFT.transferFrom(address(this), seller, _tokenId);

        removeOrder(_tokenId);

        emit OrderCancelled(seller, _tokenId);
    }

    function changePrice(uint256 _tokenId, uint256 newPrice) external {
        require(newPrice > 0, "price must be greater than 0");

        Order memory order = orderOfId[_tokenId];
        address seller = order.seller;
        require(msg.sender == seller, "not nft owner");

        uint256 previousPrice = order.price;
        orderOfId[_tokenId].price = newPrice;
        orders[idToIndex[_tokenId]].price = newPrice; 

        emit PriceChanged(seller, _tokenId, previousPrice, newPrice);
    }

    function onERC721Received(address operator,address from, uint256 tokenId, bytes calldata data) external returns(bytes4) {
        require(msg.sender == address(cNFT), "only cnft address");
        uint256 price = toUint256(data, 0);
        require(price > 0, "price must be greater than 0");

        orders.push(Order(from, tokenId, price));
        orderOfId[tokenId] = Order(from, tokenId, price);
        idToIndex[tokenId] = orders.length - 1;

        emit NewOrder(from, tokenId, price);
        
        return this.onERC721Received.selector; 
    }

    function getOrderLength() external view returns(uint256) {
        return orders.length;
    }

    function getAllNFTs() external view returns(Order[] memory) {
        return orders;
    }

    function getMyNFTs() external view returns(Order[] memory) {
        Order[] memory myorders = new Order[](orders.length);
        uint256 count = 0;

        for(uint256 i = 0; i < orders.length; i++){
            if(orders[i].seller == msg.sender) {
                myorders[count] = orders[i];
                count++;
            }
        }
        return myorders;
    }

    function removeOrder(uint256 _tokenId) internal {
        uint256 index = idToIndex[_tokenId];
        uint256 lastIndex = orders.length - 1;
        
        if(index != lastIndex) {
            Order storage lastOrder = orders[lastIndex];
            orders[index] =  lastOrder;
            idToIndex[lastOrder.tokenId] = index;
        }
        orders.pop;
        delete orderOfId[_tokenId];
        delete idToIndex[_tokenId];
    }

    function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
        require(_bytes.length >= (_start + 32), "Read out of bounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }
}