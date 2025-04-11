"use client";
import React, { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import Card from "./Card";
import { CONTRACT_ADDRESS, ABI } from "../../../constants/constants";
import Loading from "./Loading";
import NotFound from "./NotFound";
import ErrorRetry from "./ErrorRetry";

export const CardList = () => {
  const [tokenDetails, setTokenDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getAllTokens = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const tokens = await tokenContract.getTokens();
        if (tokens && tokens.length) {
          setTokenDetails(tokens);
        }
      }
    } catch (error) {
      console.log(error);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllTokens();
  }, []);
  return (
    <div className="cardlist">
      {loading ? (
        <div className="loading-tokens">
          <Loading text="Fetching tokens..." />
        </div>
      ) : !loading && !tokenDetails.length ? (
        <NotFound />
      ) : !loading && tokenDetails.length ? (
        <div>
          <div className="trending">now trending</div>
          <div className="cardlist-container">
            {tokenDetails.map((token) => {
              return <Card />;
            })}
          </div>
        </div>
      ) : (
        <ErrorRetry tryAgain={getAllTokens} />
      )}
    </div>
  );
};
