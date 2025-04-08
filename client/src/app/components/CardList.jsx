"use client";
import React, { useEffect } from "react";
import { Contract, ethers } from "ethers";
import Card from "./Card";
import { CONTRACT_ADDRESS, ABI } from "../../../constants/constants";

export const CardList = () => {
  const getAllTokens = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        console.log("tokenContract", tokenContract);
        const tokens = await tokenContract.getTokens();
        console.log("tokens", tokens);
        console.log("tokenContract", tokenContract);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTokens();
  });
  return (
    <div className="cardlist">
      <div className="trending">now trending</div>
      <div className="cardlist-container">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  );
};
