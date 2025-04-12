"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link.js";
import { Contract, ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../../constants/constants.js";
import Searchbar from "./components/Searchbar.jsx";
import { CardList } from "./components/CardList.jsx";

export const Main = () => {
  const [tokenDetails, setTokenDetails] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  let filterData = (searchValue) => {
    console.log(searchValue);
    if (searchValue == "") {
      setFilteredTokens(tokenDetails);
    } else {
      const filteredValue = tokenDetails.filter((data) => {
        const [tokenAddress, name, creator, image, description, sold, raised, isOpen] = data;
        return name.includes(searchValue);
      });
      setFilteredTokens(filteredValue);
    }
  };

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
          setFilteredTokens(tokens);
        }
        console.log("tokens", tokens);
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
    <div>
      <div className="start-coin">
        <Link href="/create-token">[start a new coin]</Link>
      </div>
      <Searchbar filterData={filterData} />
      <CardList tokenDetails={filteredTokens} loading={loading} error={error} />
    </div>
  );
};
