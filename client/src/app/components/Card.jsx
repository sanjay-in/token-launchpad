import React from "react";
import { trimAddress } from "../../../utils/common";

export default ({ name, description, creator }) => {
  return (
    <div className="card-elements">
      <img src="https://pexx.com/chaindebrief/wp-content/uploads/2023/05/image-20.png" className="card-img" />
      <div className="info-container">
        <div className="createdby">created by {trimAddress(creator, 0, 7)} 3h ago</div>
        <div className="market-cap">market cap</div>
        <div className="title">Title: {name}</div>
        <div className="description">Description: {description.substr(0, 50)}...</div>
      </div>
    </div>
  );
};
