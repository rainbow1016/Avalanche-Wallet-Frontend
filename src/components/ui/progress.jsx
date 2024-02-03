"use client";
import NextNProgress from "nextjs-progressbar";

const NextNProgressClient = () => {
  return (
    <NextNProgress
      color="#47409A"
      startPosition={0.3}
      stopDelayMs={200}
      height={3}
      showOnShallow={true}
    />
  );
};

export default NextNProgressClient;
