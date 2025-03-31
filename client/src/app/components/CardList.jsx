import React from "react";
import Card from "./Card";

export const CardList = () => {
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
