"use client";
import React, { useEffect, useState } from "react";
import { connectWallet, trimAddress } from "../../../utils/common";
import HeaderImage from "../../../public/header.png";

export default function Navbar() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    connectWallet().then((account) => {
      if (account && account.length) {
        setWalletAddress(account[0]);
        setIsWalletConnected(true);
      }
    });

    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress(null);
      }
    });
  }, []);

  return (
    <nav className="bg-gray-800 navbar">
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        {isWalletConnected ? (
          <div className="wallet-address">Wallet Address: {walletAddress ? trimAddress(walletAddress) : null}</div>
        ) : (
          <button
            type="button"
            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            Connect Wallet
          </button>
        )}
      </div>
      <img className="header" src={HeaderImage.src} />
    </nav>
  );
}
