// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {Token} from "../src/Token.sol";
import {TokenLaunchPad} from "../src/TokenLaunchpad.sol";
import {DeployTokenLaunchpad} from "../script/DeployTokenLaunchpad.s.sol";

contract TestTokenLaunchpad is Test {
    TokenLaunchPad public tokenLaunchpad;

    string public name = "TestToken";
    string public symbol = "TT";
    string public image =
        "https://media.istockphoto.com/id/1268510010/vector/golden-one-token-coin-icon.jpg?s=612x612&w=0&k=20&c=rQ7yWnMEBFy8jUcjCjqa48-1ARmflM6aIn9svQ1En8E=";

    function setUp() external {
        DeployTokenLaunchpad deployTokenLaunchpad = new DeployTokenLaunchpad();
        tokenLaunchpad = deployTokenLaunchpad.run();
    }

    function testFee() external view {
        uint256 platFormFee = 1 * 10 ** 15;
        uint256 fetchedPlatformFee = tokenLaunchpad.s_fee();
        assertEq(platFormFee, fetchedPlatformFee);
    }

    function testCreateToken() external {
        vm.deal(msg.sender, 10);
        tokenLaunchpad.create{value: 0.002 ether}(name, symbol, image);

        address[] memory tokenAddresses = tokenLaunchpad.getTokenAddresses();
        TokenLaunchPad.TokenDetails memory createdToken = tokenLaunchpad.getTokenDetails(tokenAddresses[0]);

        assertEq(tokenAddresses.length, 1);
        assertEq(createdToken.name, name);
        assertEq(createdToken.token, tokenAddresses[0]);
        assertEq(createdToken.imageUrl, image);
        assertEq(createdToken.sold, 0);
        assertEq(createdToken.raised, 0);
        assertEq(createdToken.isOpen, true);
    }

    function testRevertIfEthNotPaidForCreation() external {
        vm.expectRevert(TokenLaunchPad.TokenLaunchPad__AmountLessThanFee.selector);
        tokenLaunchpad.create(name, symbol, image);
    }

    function testErrorForUnlistedTokenBuy() external {
        address token = address(1);

        vm.expectRevert(TokenLaunchPad.TokenLaunchPad__TokenNotListed.selector);
        tokenLaunchpad.buy(token, 2000);
    }

    function testErrorForSaleClosedInBuy() external {
        vm.deal(msg.sender, 100);
        tokenLaunchpad.create{value: 0.002 ether}(name, symbol, image);

        address[] memory tokens = tokenLaunchpad.getTokenAddresses();
        address token = tokens[0];

        uint256 tokensToBuy = tokenLaunchpad.MAX_SUPPLY() - tokenLaunchpad.INIT_SUPPLY();
        try tokenLaunchpad.buy{value: 24 ether}(token, tokensToBuy) {
            console.log("success");
        } catch Error(string memory reason) {
            console.log("Revert reason: ", reason);
        }

        vm.expectRevert(TokenLaunchPad.TokenLaunchPad__SaleClosed.selector);
        tokenLaunchpad.buy(token, 2000);
    }

    function testErrorForNotEnoughSupplyInBuy() external {
        vm.deal(msg.sender, 100);
        tokenLaunchpad.create{value: 0.002 ether}(name, symbol, image);

        address[] memory tokens = tokenLaunchpad.getTokenAddresses();
        address token = tokens[0];

        uint256 tokensToBuy = (tokenLaunchpad.MAX_SUPPLY() - tokenLaunchpad.INIT_SUPPLY()) + 1;
        vm.expectRevert(TokenLaunchPad.TokenLaunchPad__NotEnoughSupply.selector);
        tokenLaunchpad.buy{value: 24 ether}(token, tokensToBuy);
    }

    function testErrorInsufficientETHInBuy() external {
        vm.deal(msg.sender, 100);
        tokenLaunchpad.create{value: 0.002 ether}(name, symbol, image);

        address[] memory tokens = tokenLaunchpad.getTokenAddresses();
        address token = tokens[0];

        uint256 tokensToBuy = tokenLaunchpad.MAX_SUPPLY() - tokenLaunchpad.INIT_SUPPLY();
        vm.expectRevert(TokenLaunchPad.TokenLaunchPad__InsufficientETH.selector);
        tokenLaunchpad.buy{value: 2 ether}(token, tokensToBuy);
    }

    function testBuyEvent() external {
        vm.deal(msg.sender, 100);
        tokenLaunchpad.create{value: 0.002 ether}(name, symbol, image);

        address[] memory tokens = tokenLaunchpad.getTokenAddresses();
        address token = tokens[0];

        uint256 tokensToBuy = tokenLaunchpad.MAX_SUPPLY() - tokenLaunchpad.INIT_SUPPLY();
        vm.expectEmit(true, false, false, false);
        emit TokenLaunchPad.Buy(token, tokensToBuy);
        tokenLaunchpad.buy{value: 24 ether}(token, tokensToBuy);
    }

    function testCalculateCost() external view {
        uint256 price = tokenLaunchpad.calculateCost(800000, 800000);
        assertEq(price, 24 ether);
    }

    function testGetTokens() external view {
        tokenLaunchpad.getTokens();
    }
}
