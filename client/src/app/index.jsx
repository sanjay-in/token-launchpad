import React from "react";
import Link from "next/link.js";
import Searchbar from "./components/Searchbar.jsx";
import { CardList } from "./components/CardList.jsx";

export const Main = () => {
  return (
    <div>
      <div className="start-coin">
        <Link href="/create-token">[start a new coin]</Link>
      </div>
      <Searchbar />
      <CardList />
    </div>
  );
};
