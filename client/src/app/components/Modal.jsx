"use client";
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import Success from "../../../public/success.png";
import Error from "../../../public/error.png";

const ModalDisplay = ({ type, closeModal, show }) => {
  const successDescription = "Token has been created succesfully. You can find them on the listed page.";
  const errorDescription = "Failed to create the token. Please try again after some time.";

  const close = () => {
    if (type == "success") {
      window.location.href = "/";
    } else {
      closeModal(false);
    }
  };
  return (
    <Dialog open={show} onClose={() => close()} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/20 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="modal-body px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  <img src={type == "success" ? Success.src : Error.src} />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className={`${type == "success" ? "success-text-header" : "error-text-header"} text-base font-semibold text-green-900`}
                  >
                    {type == "success" ? "Success" : "Error"}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">{type == "success" ? successDescription : errorDescription}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-body px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                data-autofocus
                onClick={() => close()}
                className="modal-close-button mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalDisplay;
