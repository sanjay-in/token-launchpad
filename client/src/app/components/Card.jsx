import React from "react";
import { trimAddress } from "../../../utils/common";

export default ({ name, description, creator, image, sold }) => {
  return (
    <div className="card-elements">
      <img className="card-img" src={image} />
      <div className="info-container">
        <div className="createdby">created by {trimAddress(creator, 0, 11)}</div>
        <div className="market-cap">sold tokens {sold.toLocaleString()}</div>
        <div className="title">Title: {name}</div>
        <div className="description">Description: {description.substr(0, 50)}...</div>
      </div>
    </div>
  );
};
