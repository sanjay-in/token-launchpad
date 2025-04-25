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
  const [imageURL, setImageURL] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const uploadImage = async (file) => {
    if (file === null) {
      console.error("Please select an image");
      return;
    }
    setIsUploadingImage(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      data.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
      const fetchedResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "post",
        body: data,
      });
      const jsonResponse = await fetchedResponse.json();
      setImageURL(jsonResponse.url);
      setIsUploadingImage(false);
    } catch (error) {
      console.error(err);
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    setImage(e.target.files[0]);
    await uploadImage(e.target.files[0]);
  };

  const createToken = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const fee = await tokenContract.s_fee();
        const createTokenResponse = await tokenContract.create(name, ticker, imageURL, description, { value: fee });
        const createTokenReceipt = await createTokenResponse.wait();
        if (createTokenReceipt.status == 1) {
          setIsSuccess(true);
          setIsCreating(false);
          setShowModal(true);
        }
      } else {
        console.error("no window ethereum");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("error:", error);
      setIsError(true);
      setIsCreating(false);
      setShowModal(true);
    }
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
              onChange={(e) => handleImageUpload(e)}
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
        {image && isUploadingImage ? (
          <div role="status" className="uploading-image-spinner">
            <div>Uploading image...</div>
            <svg
              aria-hidden="true"
              className="inline w-4 h-4 text-grey-200 animate-spin dark:text-grey-600 fill-green-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span class="sr-only">Loading...</span>
          </div>
        ) : typeof image == "string" && !isUploadingImage ? (
          <li className="flex items-center uploading-image-spinner">
            Image Uploaded
            <svg
              className="w-4 h-4 me-2 text-green-500 dark:text-green-400 shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </li>
        ) : null}
      </div>
      <Modal type={isError ? "error" : "success"} show={showModal} closeModal={setShowModal} />
    </div>
  );
};
