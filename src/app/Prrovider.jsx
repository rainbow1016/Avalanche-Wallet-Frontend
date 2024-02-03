"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const Providers = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#47409A"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export default Providers;
