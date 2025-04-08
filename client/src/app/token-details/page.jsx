import React from "react";

export default () => {
  return (
    <div className="token-details">
      <div className="start-coin">[go back]</div>
      <div className="details-containers">
        <div className="details-container">
          <div className="details-heading">Token details for Spongebob token</div>
          <img className="details-image" src="" />
          <div className="details-content">
            <span className="details-content-heading">Creator Address:</span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">Token Address:</span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">Funding Raised:</span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">Token Symbol:</span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">Description:</span>
          </div>
        </div>
        <div className="details-container">
          <div className="details-content">
            <span className="details-content-heading">Bonding Curve Progress:</span>
            0/24 ETH
          </div>
          <div className="details-content-bonding-curve-description">
            When the market cap reaches 24 ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be
            burned. Progression increases as the price goes up.
          </div>
          <div className="details-content">
            <span className="details-content-heading">Remaining tokens available for sale:</span>
            800,000 / 800,000
          </div>
          <div className="buy-tokens-heading">Buy Tokens</div>
          <input type="number" className="token-quantity-field" placeholder="Enter token quantity" />
          <button className="purchase-button">Purchase</button>
        </div>
      </div>
    </div>
  );
};
