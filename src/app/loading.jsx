import React from "react";
import { ClipLoader, HashLoader } from "react-spinners";
const Loading = () => {
  return (
    <div className="w-full h-dvh flex justify-center items-center gap-1">
      <p className="text-voilet text-xl font-sans font-medium">Loading...</p>
      <ClipLoader
        color="#091D41"
        loading={true}
        size={40}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Loading;
