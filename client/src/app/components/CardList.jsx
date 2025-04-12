"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "./Card";
import Loading from "./Loading";
import NotFound from "./NotFound";
import ErrorRetry from "./ErrorRetry";

export const CardList = ({ loading, error, tokenDetails }) => {
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
              const [tokenAddress, name, creator, image, description, sold, raised, isOpen] = token;
              return (
                <Link href={`/token-details?token=${tokenAddress}`}>
                  <Card key={tokenAddress} name={name} description={description} creator={creator} />
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <ErrorRetry tryAgain={getAllTokens} />
      )}
    </div>
  );
};
