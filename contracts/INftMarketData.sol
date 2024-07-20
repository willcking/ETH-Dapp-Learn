// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract INftMarketData {

    struct Order{
        address seller;
        uint256 tokenId;
        uint256 price;
    }

}