"use client";

import { Button } from "@/components/ui/button";
import HomeBg from "../../../public/home-bg.svg";
import Image from "next/image";
import { Footer } from "../common/footer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NProgress from "nprogress";
import { getSeed } from "@/lib/addressUtils";
import { getERC20Balance } from "../../lib/tokenUtils.mjs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Send } from "@/components/ui/Send";
import { getCookie } from "@/components/ui/cookies";
const Page = () => {
  const searchParams = useSearchParams();

  const pathname = usePathname();
  const intervalId = useRef();
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState([]);

  async function fetchBalance() {
    console.log("fetchBalance");
    // your code to fetch balance goes here
    try {
      const afterLoginRes = getCookie("afterLoginRes");
      let result = getSeed(
        afterLoginRes.encryptedSeed,
        afterLoginRes.salt,
        afterLoginRes.iv
      );
      setAddress(result.address);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  useEffect(() => {
    if (address != "") {
      const updateBalance = async () => {
        const balance = await getERC20Balance(address);
        setBalance(balance);
      };

      intervalId.current = setInterval(updateBalance, 5000);
    }
  }, [address]);
  useEffect(() => {
    fetchBalance();
  }, []);
  console.log("current Balance is ", balance);

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    handleStop();

    return () => {
      handleStart();
    };
  }, [pathname, searchParams]);

  return (
    <div
      className=" relative w-full gap-3 h-dvh font-sans font-medium flex justify-start items-center flex-col p-4 bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${HomeBg.src})`
        //     backgroundPosition: "center",
        //     backgroundSize: "cover",
      }}
    >
      <h1 className="text-2xl text-voilet">Wallet</h1>
      <div className=" flex justify-center mt-5 gap-2 w-full overflow-visible">
        <CustomBtn balance={balance} />
      </div>
      {balance && balance.length > 0 ? (
        balance.map((token, index) => (
          <Coin
            key={index}
            index={index}
            coinName={`${token.symbol}`}
            balance={token.balance}
            w={52}
            h={52}
            img={token.logoLink}
            address={token.tokenAddress}
            testnet_address={token.testnet_address}
            chainId={token.chainId}
          />
        ))
      ) : (
        <Coin
          coinName="AVAX"
          balance="0.0"
          w={52}
          h={52}
          img="https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Favax.4e9df24ea466.svg&w=32&q=75"
          address="native"
          testnet_address="native"
        />
      )}

      {/* <Coin coinName="USDP Balance" balance="0.01" w={42} h={42} img={usdp} /> */}

      <div className="bg-gradient-button-bg p-4 text-white w-100 sm:w-353px">
        <p className="tracking-wider">Transactions</p>
        <p className=" mt-2 text-sm font-normal tracking-wide">
          No transactions have been send or received
        </p>
      </div>
      <div className="border-grey border-2 p-3 text-white w-100 sm:w-353px">
        <p className="tracking-wider text-navy-blue">xxx -&gt; xxx</p>
      </div>
      <div className="border-grey border-2 p-3 text-white w-100 sm:w-353px">
        <p className="tracking-wider text-navy-blue">xxx -&gt; xxx</p>
      </div>
      <Footer />
    </div>
  );
};

export default Page;

const CustomBtn = ({ balance }) => {
  const router = useRouter();
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="142"
        height="50"
        viewBox="0 0 142 50"
        fill="none"
      >
        <defs>
          <linearGradient
            id="paint0_linear_2001_19"
            x1="8.5"
            y1="25"
            x2="141"
            y2="25"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#47409A" />
            <stop offset="1" stopColor="#4B6AFF" />
          </linearGradient>
        </defs>
        <path
          d="M141 1H16.7041L1 49H129.305L141 1Z"
          stroke="url(#paint0_linear_2001_19)"
        />

        <foreignObject width="100%" height="100%">
          <div className="flex justify-center items-center mt-1">
            <DialogSend balance={balance} />
          </div>
        </foreignObject>
      </svg>

      <Button
        variant="none"
        className="text-white w-36 h-15 bg-gradient-button-bg font-normal tracking-wide text-base"
        style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
      >
        Request
      </Button>
    </>
  );
};

const Coin = ({
  img,
  coinName,
  balance,
  w,
  h,
  testnet_address,
  chainId,
  index
}) => {
  const [data, setData] = useState([]);

  // Map the filteredData to an array of strings containing symbol and balance

  return (
    <div className="border-grey border-2 flex gap-3 justify-start items-center w-100 sm:w-353px p-4">
      <div className="bg-navy-blue rounded-full w-15 h-full flex justify-center border-grey border-2">
        <Image
          src={img}
          alt="*coin"
          width={w}
          height={h}
          className="rounded-full"
        />
      </div>
      <div className="w-90">
        <p className="text-base text-navy-blue font-sans font-semibold">
          {coinName}
        </p>
        <p>{balance}</p>
      </div>
    </div>
  );
};

export function DialogSend({ balance }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          variant="none"
          className="text-voilet font-normal tracking-wide text-base"
        >
          Send
        </Button>
      </DialogTrigger>
      <DialogContent className=" bg-white h-fit  max-w-fit">
        <Send balance={balance} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
