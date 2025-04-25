"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, Contract, ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "../../../constants/constants";
import BuyConfirmationModal from "../components/BuyConfirmationModal";
import Loading from "../components/Loading";
import ImageNotAvailable from "../../../public/Image_not_available.png";

export default () => {
  const router = useRouter();

  const [paramsTokenAddress, setParamsTokenAddress] = useState(null);

  const [token, setToken] = useState({
    token: 0,
    name: "",
    creator: 0,
    imageUrl: ImageNotAvailable.src,
    description: "",
    sold: 0,
    raised: 0,
    isOpen: null,
  });
  const [tokensToBuy, setTokensToBuy] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const [percentageValues, setPercentageValues] = useState({
    fundingRaisedPercentage: 0,
    totalSupplyPercentage: 0,
  });
  const [fundingValues, setFundingValues] = useState({
    fundingGoal: 0,
    initialSupply: 0,
    totalSupply: 0,
  });

  const getTokenDetails = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);

        const fetchedToken = await tokenContract.getTokenDetails(paramsTokenAddress);
        let tokenAddress, name, creator, imageUrl, description, sold, raised, isOpen;
        if (fetchedToken && fetchedToken.length) {
          [tokenAddress, name, creator, imageUrl, description, sold, raised, isOpen] = fetchedToken;
          console.log(fetchedToken);
          setToken({
            token: tokenAddress,
            name,
            creator,
            imageUrl,
            description,
            sold: Number(sold),
            raised: Number(ethers.formatEther(raised)),
            isOpen,
          });
          return 1;
        }
      }
    } catch (error) {
      if (error.code == "INVALID_ARGUMENT" && error.argument == "address") {
        setIsInvalidToken(true);
      }
      console.error(error);
    }
  };

  const getFundingDetails = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);

        const fundingGoal = await tokenContract.TARGET();
        const initialSupply = parseInt(await tokenContract.INIT_SUPPLY());
        const maxSupply = parseInt(await tokenContract.MAX_SUPPLY());
        const totalSupply = maxSupply - initialSupply;

        setFundingValues({
          fundingGoal: Number(ethers.formatEther(fundingGoal)),
          initialSupply,
          totalSupply,
        });
        return 1;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getDetails = async () => {
    await getTokenDetails();
    await getFundingDetails();
  };

  const buyTokens = async () => {
    setIsBuying(true);
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const currentSupply = parseInt(await tokenContract.getTotalSupply(token.token));
        const costOfTokens = await tokenContract.calculateCost(currentSupply, tokensToBuy);
        const buyTransactionReciept = await tokenContract.buy(token.token, tokensToBuy, { value: costOfTokens });
        const buyTransactionResponse = await buyTransactionReciept.wait();
        if (buyTransactionResponse.status == 1) {
          setIsConfirmationModalOpen(true);
        }
      }
    } catch (error) {
      console.log(error);
      setIsConfirmationModalOpen(true);
      setIsError(true);
    }
    setIsBuying(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    setParamsTokenAddress(params.get("token"));

    if (isFirstRender) {
      getDetails();
    }
    setIsFirstRender(false);

    const { fundingGoal, initialSupply, totalSupply } = fundingValues;
    const fundingRaisedPercentage = (token.raised / fundingValues.fundingGoal) * 100;
    const totalSupplyPercentage = (token.sold / totalSupply) * 100;
    setPercentageValues({
      fundingRaisedPercentage,
      totalSupplyPercentage,
    });

    setIsLoading(false);
  }, [fundingValues]);

  return (
    <div className="token-details">
      {isLoading ? (
        <div className="loading-token-details">
          <Loading text="Fetching token details..." />
        </div>
      ) : isInvalidToken ? (
        <div className="loading-token-details">Invalid Token. Please check your token address.</div>
      ) : (
        <>
          <div className="start-coin" onClick={() => router.back()}>
            [go back]
          </div>
          <div className="details-containers">
            <div className="details-container">
              <div className="details-heading">Token details for {token.name}</div>
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
                  Funding Raised: <span className="details-content-value">{token.raised} ETH</span>
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
                {token.raised} / 24 ETH
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${percentageValues.fundingRaisedPercentage}%` }}></div>
              </div>
              <div className="details-content-bonding-curve-description">
                When the market cap reaches 24 ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be
                burned. Progression increases as the price goes up.
              </div>
              <div className="details-content">
                <span className="details-content-heading">Remaining tokens available for sale:</span>
                {token.sold.toLocaleString()} / {fundingValues.totalSupply.toLocaleString()}
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${percentageValues.totalSupplyPercentage}%` }}></div>
              </div>
              <div className="buy-tokens-heading">Buy Tokens</div>
              <input
                type="number"
                className="token-quantity-field"
                placeholder="Enter token quantity"
                value={tokensToBuy}
                onChange={(e) => setTokensToBuy(e.target.value)}
              />
              <button className="purchase-button" onClick={buyTokens}>
                Purchase
              </button>
            </div>
          </div>
        </>
      )}
      {isConfirmationModalOpen ? (
        <BuyConfirmationModal
          type={isError ? "error" : "success"}
          closeModal={setIsConfirmationModalOpen}
          show={isConfirmationModalOpen}
          amountOfTokens={tokensToBuy}
        />
      ) : null}
    </div>
  );
};
