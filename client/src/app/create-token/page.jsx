"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Contract, ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../../../constants/constants";
import Loading from "../components/Loading";
import Modal from "../components/Modal";

export default () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const createToken = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (window.ethereum) {
        console.log("entered");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const fee = await tokenContract.s_fee();
        const createTokenResponse = await tokenContract.create(name, ticker, image, description, { value: fee });
        const createTokenReceipt = await createTokenResponse.wait();
        if (createTokenReceipt.status == 1) {
          setIsSuccess(true);
        }
      } else {
        console.log("no window ethereum");
      }
    } catch (error) {
      console.log("error:", error);
      setIsError(true);
    }
    setIsCreating(false);
  };

  return (
    <div className="create-token">
      <div className="start-coin" onClick={() => router.back()}>
        [go back]
      </div>
      <div className="form">
        <form className="max-w-sm mx-auto" onSubmit={(e) => createToken(e)}>
          <div className="mb-5">
            <label htmlFor="text" className="block mb-2 text-sm font-medium dark:text-white form-label">
              name
            </label>
            <input
              type="text"
              id="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black-200 border border-gray-300 text-white-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="text" className="block mb-2 text-sm font-medium dark:text-white form-label">
              ticker
            </label>
            <input
              type="text"
              id="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="bg-black-200 border border-gray-300 text-white-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="text" className="block mb-2 text-sm font-medium dark:text-white form-label">
              description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-black-200 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="text" className="block mb-2 text-sm font-medium dark:text-white form-label">
              image or video
            </label>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="bg-black-200 border border-gray-300 text-white-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="create-button text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 form-button"
            disabled={isCreating}
          >
            {isCreating ? <Loading /> : "Create Token"}
          </button>
        </form>
      </div>
      <Modal type={isError ? "error" : "success"} show={showModal} closeModal={setShowModal} />
    </div>
  );
};
