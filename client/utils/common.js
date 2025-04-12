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

export const trimAddress = (address, startTrimIndex, endTrimIndex) => {
  let trimStartIndex = startTrimIndex ? startTrimIndex : 0;
  let trimEndIndex = endTrimIndex ? endTrimIndex : 12;
  const maskedAddress = address.substring(trimStartIndex, trimEndIndex) + "..." + address.substring(address.length - 5, address.length);
  return maskedAddress;
};
