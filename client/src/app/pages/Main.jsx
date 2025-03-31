import React from "react";
import Navbar from "../components/Navbar.jsx";
import Searchbar from "../components/Searchbar.jsx";
import { CardList } from "../components/CardList.jsx";

export const Main = () => {
  return (
    <div>
      <Navbar />
      <div className="start-coin">[start a new coin]</div>
      <Searchbar />
      <CardList />
    </div>
  );
};
