"use client";

import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSeed } from "@/lib/addressUtils";
import { sendToken } from "@/lib/tokenUtils.mjs";
import { getCookie, setCookie } from "@/components/ui/cookies";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { pubToAdd } from "../../lib/addressUtils.js";
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const Send = ({ balance = [], close }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  let avaxBalance = 0;
  let nativeToken = balance.find(
    (element) => element.tokenAddress === "native"
  );
  if (nativeToken) {
    avaxBalance = nativeToken.balance;
  }
  const router = useRouter();
  const formSchema = z.object({
    amount: z.string().min(1, {
      message: "amount is required."
    }),
    message: z.string().min(5, {
      message: "enter message to continue"
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      message: ""
    }
  });

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleInputAmountChange = (event) => {
    setInputAmount(Number(event.target.value));
  };
  const handleInputMessageChange = (event) => {
    setInputMessage(event.target.value);
  };

  const onSubmit = async () => {
    let encryptedSeed = getCookie("afterLoginRes").encryptedSeed;
    let salt = getCookie("afterLoginRes").salt;
    let iv = getCookie("afterLoginRes").iv;
    const { seed, privateKey, publicKey, address } = getSeed(
      encryptedSeed,
      salt,
      iv
    );
    let toAddress = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/getPublicKey`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: inputValue
        })
      }
    ).then((response) => response.json());
    if (toAddress.publicKey) {
      const toAdd = pubToAdd(toAddress.publicKey);
      let txHash = await sendToken(
        privateKey,
        toAdd,
        "native",
        `${inputAmount}`,
        100,
        2
      );
      console.log(txHash);
      inputMessage != "" &&
        (await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/recordMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            txHash: txHash,
            message: inputMessage
          })
        }));
    } else {
      toast.error("Doesn't exist user");
    }
  };

  return (
    <div className=" bg-white flex flex-col h-h-90 gap-0 justify-between items-center w-full sm:w-353px">
      <div className="p-0 w-full">
        <h1 className="text-2xl text-left w-full text-navy-blue">Send</h1>
        <div className="relative w-100 sm:w-363px mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            type="text"
            placeholder="Search for a contact or paste"
            className="pl-12 pr-4 placeholder:text-navy-blue border-grey border-2 rounded-none"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
        <div className="w-full">
          <Coin
            coinName="AVAX"
            balance={avaxBalance}
            img="https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Favax.4e9df24ea466.svg&w=32&q=75"
            w={52}
            h={52}
            address="native"
            testnet_address="native"
          />
        </div>

        {/* <Form {...form}> */}
        <form
          // onSubmit={() => form.handleSubmit(onSubmit)}
          onSubmit={onSubmit}
          className="space-y-2 w-100 sm:max-w-modal-w mt-2"
        >
          {/* <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl className="bg-white"> */}
          <Input
            autoComplete="amount"
            className=" border-grey border-2 rounded-none placeholder:text-navy-blue focus:outline-none active:outline-none outline-0 bg-transparent h-12"
            style={{
              boxShadow: "none",
              backgroundColor: "transparent"
            }}
            placeholder="Enter Amount"
            type="number"
            id="amount"
            name="amount"
            value={inputAmount}
            onChange={handleInputAmountChange}
            // {...field}
          />
          {/* </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl className="bg-white"> */}
          <Textarea
            autoComplete="current-password"
            className=" border-grey border-2 rounded-none placeholder:text-navy-blue focus:outline-none active:outline-none outline-0 bg-transparent h-32"
            style={{
              boxShadow: "none",
              backgroundColor: "transparent"
            }}
            placeholder="Message"
            type="textarea"
            id="message"
            name="message"
            value={inputMessage}
            onChange={handleInputMessageChange}
            // {...field}
          />
          {/* </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            /> */}
        </form>
        {/* </Form> */}
      </div>

      <div className=" flex justify-center gap-2 mb-2 w-full overflow-visible">
        <CustomBtn
          isFormValid={inputAmount * 1 !== 0 && inputValue != ""}
          onSubmit={onSubmit}
          close={close}
        />
      </div>
    </div>
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

const CustomBtn = ({ onSubmit, isFormValid, close }) => {
  const router = useRouter();
  const handleNext = async () => {
    await onSubmit();
    await sleep(2000);
    close();
  };
  return (
    <>
      {/* <DialogClose> */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="142"
        height="45"
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

        <foreignObject width="100%" height="120%">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="flex justify-center items-center mt-1"
          >
            <Button
              variant="none"
              onClick={close}
              className="text-voilet font-normal tracking-wide text-base"
            >
              Cancel
            </Button>
          </div>
        </foreignObject>
      </svg>
      {/* </DialogClose> */}

      {/* <DialogClose disabled={!isFormValid}> */}
      <>
        <Button
          variant="none"
          disabled={!isFormValid}
          onClick={handleNext}
          className="text-white w-36 h-15 bg-gradient-button-bg font-normal tracking-wide text-base"
          style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
        >
          Next
        </Button>
      </>
      {/* </DialogClose> */}
    </>
  );
};
