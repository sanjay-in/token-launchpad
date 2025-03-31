// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Token} from "./Token.sol";

contract TokenLaunchPad {
    error TokenLaunchPad__AmountLessThanFee();
    error TokenLaunchPad__SaleClosed();
    error TokenLaunchPad__AmountLow();
    error TokenLaunchPad__AmountExceeded();
    error TokenLaunchPad__InsufficientETH();

    struct TokenDetails {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    uint256 public constant TARGET = 2 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public immutable i_fee;
    address public immutable i_owner;

    uint256 public s_totalTokens;
    address[] public s_tokens;
    mapping(address => TokenDetails) public s_tokenToDetails;

    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        i_fee = _fee;
        i_owner = msg.sender;
    }

    function getTokenDetails(uint256 _index) public view returns (TokenSale memory) {
        return s_totalTokens[s_tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(string memory _name, string memory _symbol) external payable {
        if (msg.value < i_fee) {
            TokenLaunchPad__AmountLessThanFee();
        }

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);
        s_tokens.push(address(token)); // Add token address to array
        totalTokens++;
        TokenSale memory detail = TokenDetails(address(token), _name, msg.sender, 0, 0, true);
        s_tokenToDetails[address(token)] = detail;

        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {
        TokenSale memory detail = s_tokenToDetails[_token];

        if (detail.isOpen == false) revert TokenLaunchPad__SaleClosed();
        if (_amount < 1 ether) revert TokenLaunchPad__AmountLow();
        if (_amount > 10000 ether) revert TokenLaunchPad__AmountExceeded();

        uint256 cost = getCost(detail.sold); // Calculate the price of 1 token based on the total bought.
        uint256 price = cost * (_amount / 10 ** 18); // Determine the total price for X amount.

        if (msg.value < price) revert TokenLaunchPad__InsufficientETH();
        
        detail.sold += _amount;
        detail.raised += price;

        // Prevent buy once token reached target or exceeded token limit
        if (detail.sold >= TOKEN_LIMIT || detail.raised >= TARGET) {
            detail.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);
        emit Buy(_token, _amount);
    }

    function deposit(address _token) external {
        // The remaining token balance and the ETH raised
        // would go into a liquidity pool like Uniswap V3.
        // For simplicity we'll just transfer remaining
        // tokens and ETH raised to the creator.

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: Target not reached");

        // Transfer tokens
        token.transfer(sale.creator, token.balanceOf(address(this)));

        // Transfer ETH raised
        (bool success,) = payable(sale.creator).call{value: sale.raised}("");
        require(success, "Factory: ETH transfer failed");
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Factory: Not owner");

        (bool success,) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");
    }
}
