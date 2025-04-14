"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Contract, ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "../../../constants/constants";

export default () => {
  const params = useSearchParams();
  const paramsTokenAddress = params.get("token");

  const [token, setToken] = useState({
    token: 0,
    name: "",
    creator: 0,
    imageUrl: "",
    description: "",
    sold: 0,
    raised: 0,
    isOpen: null,
  });

  let fundingGoal;
  let fundingRaised;
  let fundingRaisedPercentage = 0;
  let totalSupplyPercentage;
  let initialSupply;
  let totalSupply;

  const getTokenDetails = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const fetchedToken = await tokenContract.getTokenDetails(paramsTokenAddress);
        let tokenAddress, name, creator, imageUrl, description, sold, raised, isOpen;
        console.log(fetchedToken);
        if (fetchedToken && fetchedToken.length) {
          [tokenAddress, name, creator, imageUrl, description, sold, raised, isOpen] = fetchedToken;
          fundingRaised = parseInt(raised);
          setToken({
            token: tokenAddress,
            name,
            creator,
            imageUrl,
            description,
            sold: parseInt(sold),
            raised: parseInt(raised),
            isOpen,
          });
          return 1;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFundingDetails = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        initialSupply = parseInt(await tokenContract.INIT_SUPPLY());
        totalSupply = parseInt(await tokenContract.MAX_SUPPLY());
        fundingGoal = parseInt(await tokenContract.TARGET());
        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDetails = async () => {
    await getTokenDetails();
    await getFundingDetails();
    fundingRaisedPercentage = (fundingRaised / fundingGoal) * 100;
    totalSupplyPercentage = ((totalSupply - initialSupply) / ethers.formatUnits(totalSupply - initialSupply, "ether")) * 100;
  };

  useEffect(() => {
    getDetails();
  }, []);

  return (
    <div className="token-details">
      <div className="start-coin">[go back]</div>
      <div className="details-containers">
        <div className="details-container">
          <div className="details-heading">Token details for {token.name} token</div>
          <img className="details-image" src={token.imageUrl} />
          <div className="details-content">
            <span className="details-content-heading">
              Creator Address: <span className="details-content-value">{token.creator}</span>
            </span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">
              Token Address: <span className="details-content-value">{token.token}</span>
            </span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">
              Funding Raised: <span className="details-content-value">{token.raised}</span>
            </span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">
              Token Symbol: <span className="details-content-value">{token.token}</span>
            </span>
          </div>
          <div className="details-content">
            <span className="details-content-heading">
              Description: <span className="details-content-value">{token.description}</span>
            </span>
          </div>
        </div>
        <div className="details-container">
          <div className="details-content">
            <span className="details-content-heading">Bonding Curve Progress:</span>
            {token.sold}/24 ETH
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${fundingRaisedPercentage}%` }}></div>
          </div>
          <div className="details-content-bonding-curve-description">
            When the market cap reaches 24 ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be
            burned. Progression increases as the price goes up.
          </div>
          <div className="details-content">
            <span className="details-content-heading">Remaining tokens available for sale:</span>
            800,000 / 800,000
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${fundingRaisedPercentage}%` }}></div>
          </div>
          <div className="buy-tokens-heading">Buy Tokens</div>
          <input type="number" className="token-quantity-field" placeholder="Enter token quantity" />
          <button className="purchase-button">Purchase</button>
        </div>
      </div>
    </div>
  );
};
