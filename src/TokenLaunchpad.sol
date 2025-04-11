// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {Token} from "./Token.sol";
import {IUniswapV2Factory} from "@uniswap-v2/contracts/interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Pair} from "@uniswap-v2/contracts/interfaces/IUniswapV2Pair.sol";
import {IUniswapV2Router02} from "@uniswap-v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {console} from "forge-std/console.sol";

contract TokenLaunchPad {
    error TokenLaunchPad__AmountLessThanFee();
    error TokenLaunchPad__SaleClosed();
    error TokenLaunchPad__NotEnoughSupply();
    error TokenLaunchPad__TokenNotListed();
    error TokenLaunchPad__InsufficientETH();

    struct TokenDetails {
        address token;
        string name;
        address creator;
        string imageUrl;
        string description;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    uint256 public constant TARGET = 24 ether;
    uint256 public constant MAX_SUPPLY = 1000000;
    uint256 public constant INIT_SUPPLY = (20 * MAX_SUPPLY) / 100;
    uint256 public constant INITIAL_PRICE = 30000000000000; // 0.00003 ETH (10^13)
    uint256 public constant K = 8 * 10 ** 15; // Growth rate
    uint256 public constant DECIMALS = 10 ** 18;

    address private constant UNISWAP_V2_FACTORY_ADDRESS = 0xF62c03E08ada871A0bEb309762E260a7a6a880E6;
    address private constant UNISWAP_V2_ROUTER_ADDRESS = 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3;

    uint256 public s_fee;
    address public immutable i_owner;

    address[] public s_tokenAddresses;
    mapping(address => TokenDetails) public s_tokenToDetails;

    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        s_fee = _fee;
        i_owner = msg.sender;
    }

    /**
     * @notice User can create a new token and list them for buying
     * @param _name of the token
     * @param _symbol of the token
     * @param _imageUrl of the token
     * @param _description of the token
     */
    function create(string memory _name, string memory _symbol, string memory _imageUrl, string memory _description)
        external
        payable
    {
        if (msg.value < s_fee) {
            revert TokenLaunchPad__AmountLessThanFee();
        }

        Token token = new Token(_name, _symbol, INIT_SUPPLY);
        s_tokenAddresses.push(address(token)); // Add token address to array
        TokenDetails memory detail =
            TokenDetails(address(token), _name, msg.sender, _imageUrl, _description, 0, 0, true);
        s_tokenToDetails[address(token)] = detail;

        emit Created(address(token));
    }

    /**
     * @notice Buys token from the available tokens on the launchpad
     * @param _token address to buy
     * @param _amount of tokens to buy
     */
    function buy(address _token, uint256 _amount) external payable {
        if (s_tokenToDetails[_token].token == address(0)) revert TokenLaunchPad__TokenNotListed();
        TokenDetails memory detail = s_tokenToDetails[_token];

        if (detail.isOpen == false) revert TokenLaunchPad__SaleClosed();

        Token token = Token(_token);
        uint256 currentSupply = token.totalSupply();
        uint256 availableTokens = MAX_SUPPLY - currentSupply;

        if (_amount > availableTokens) revert TokenLaunchPad__NotEnoughSupply();

        uint256 mintedTokens = currentSupply - INIT_SUPPLY;
        uint256 price = calculateCost(mintedTokens, _amount);
        if (msg.value < price) revert TokenLaunchPad__InsufficientETH();

        s_tokenToDetails[_token].sold += _amount;
        s_tokenToDetails[_token].raised += price;

        if (s_tokenToDetails[_token].raised >= TARGET) {
            s_tokenToDetails[_token].isOpen = false;
            // create liquidity pool
            address pool = _createLiquidityPool(_token);

            // provide liquidity
            uint256 tokenAmount = INIT_SUPPLY;
            uint256 ethAmount = s_tokenToDetails[_token].raised;
            uint256 liquidity = _provideLiquidity(_token, tokenAmount, ethAmount);

            // burn lp token
            _burnLpTokens(pool, liquidity);
        }

        token.mint(msg.sender, _amount);
        emit Buy(_token, _amount);
    }

    /**
     * @notice Calculates the cost of the token based on the supply and the amount of tokens to buy
     * @param _currentSupply of the token
     * @param _tokenAmount amount of tokens to calculate price
     */
    function calculateCost(uint256 _currentSupply, uint256 _tokenAmount) public pure returns (uint256) {
        uint256 exp1 = (K * (_currentSupply + _tokenAmount)) / DECIMALS;
        uint256 exp2 = (K * _currentSupply) / DECIMALS;

        uint256 e1 = _exp(exp1);
        uint256 e2 = _exp(exp2);

        uint256 cost = (INITIAL_PRICE * DECIMALS * (e1 - e2)) / K;
        return cost;
    }

    // INTERNAL FUNCTIONS //

    /**
     * @dev Calculates exponent
     * @param _x number to calcuate exponent
     * @return uint256 exponent
     */
    function _exp(uint256 _x) internal pure returns (uint256) {
        uint256 sum = DECIMALS;
        uint256 term = DECIMALS;
        uint256 xPower = _x;

        for (uint256 i = 1; i <= 20; i++) {
            term = (term * xPower) / (i * DECIMALS);
            sum += term;
            if (term < 1) break;
        }

        return sum;
    }

    /**
     * @dev Creates a new liquidity pool (pair) for a given token using the Uniswap V2 Factory and Router.
     * @param _tokenAddress The address of the token to be paired with WETH in the new liquidity pool.
     * @return pair The address of the newly created liquidity pool (Uniswap V2 pair).
     */
    function _createLiquidityPool(address _tokenAddress) internal returns (address) {
        IUniswapV2Factory factory = IUniswapV2Factory(UNISWAP_V2_FACTORY_ADDRESS);
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER_ADDRESS);

        address pair = factory.createPair(_tokenAddress, router.WETH());
        return pair;
    }

    /**
     * @dev Provides liquidity to the Uniswap V2 pool by depositing both the specified token and Ether (ETH).
     * This function approves the Uniswap V2 Router to spend the specified amount of the given token,
     * then uses the Router to add liquidity to the pool.
     * The liquidity is provided in the form of a token-ETH pair, with the provided token and Ether amounts.
     * @param _tokenAddress The address of the token to be paired with Ether in the liquidity pool.
     * @param _tokenAmount The amount of the token to provide as liquidity.
     * @param _ethAmount The amount of Ether (ETH) to provide as liquidity.
     * @return liquidity The amount of liquidity tokens received after adding the liquidity.
     */
    function _provideLiquidity(address _tokenAddress, uint256 _tokenAmount, uint256 _ethAmount)
        internal
        returns (uint256)
    {
        Token tokenCt = Token(_tokenAddress);
        tokenCt.approve(UNISWAP_V2_ROUTER_ADDRESS, _tokenAmount);
        IUniswapV2Router02 router = IUniswapV2Router02(UNISWAP_V2_ROUTER_ADDRESS);
        (,, uint256 liquidity) = router.addLiquidityETH{value: _ethAmount}(
            _tokenAddress, _tokenAmount, _tokenAmount, _ethAmount, address(this), block.timestamp
        );
        return liquidity;
    }

    /**
     * @dev Burns the specified amount of Uniswap V2 LP (Liquidity Provider) tokens from the given pool.
     * This function transfers the specified amount of LP tokens to the address(0), effectively burning them.
     * @param _pool The address of the Uniswap V2 LP token pair (the liquidity pool).
     * @param _liquidity The amount of LP tokens to burn.
     * @return Returns a constant value of 1 after burning the LP tokens (for consistency).
     */
    function _burnLpTokens(address _pool, uint256 _liquidity) internal returns (uint256) {
        IUniswapV2Pair uniswapv2pairct = IUniswapV2Pair(_pool);
        uniswapv2pairct.transfer(address(0), _liquidity);
        return 1;
    }

    // GETTER FUNCTIONS //

    /**
     * @notice Gets token detail of a token
     * @param _tokenAddress address of the token
     * @return TokenDetails struct of the token
     */
    function getTokenDetails(address _tokenAddress) public view returns (TokenDetails memory) {
        return s_tokenToDetails[_tokenAddress];
    }

    /**
     * @notice Gets token details array of all listed tokens
     * @return tokenDetails array of TokenDetails
     */
    function getTokens() external view returns (TokenDetails[] memory) {
        TokenDetails[] memory tokenDetails = new TokenDetails[](s_tokenAddresses.length);
        for (uint256 i = 0; i < s_tokenAddresses.length; i++) {
            tokenDetails[i] = s_tokenToDetails[s_tokenAddresses[i]];
        }
        return tokenDetails;
    }

    /**
     * @notice Returns array of token addresses
     */
    function getTokenAddresses() external view returns (address[] memory) {
        return s_tokenAddresses;
    }
}
