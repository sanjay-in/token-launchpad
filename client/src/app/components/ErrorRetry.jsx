import React from "react";

const ErrorRetry = ({ tryAgain }) => {
  return (
    <div className="error-retry">
      <div>Some error occured. Please try again after some time.</div>
      <button
        type="button"
        onClick={() => tryAgain()}
        className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorRetry;
