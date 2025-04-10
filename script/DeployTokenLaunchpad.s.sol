// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";
import {TokenLaunchPad} from "../src/TokenLaunchpad.sol";

contract DeployTokenLaunchpad is Script {
    function run() external returns (TokenLaunchPad) {
        vm.startBroadcast();
        TokenLaunchPad tokenLaunchpad = new TokenLaunchPad(1 * 10 ** 15);
        vm.stopBroadcast();
        return tokenLaunchpad;
    }
}
