export const connectWallet = async () => {
  try {
    if (window.ethereum) {
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      return account;
    }
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

export const trimAddress = (address) => {
  const maskedAddress = address.substring(0, 12) + "..." + address.substring(address.length - 5, address.length);
  return maskedAddress;
};
