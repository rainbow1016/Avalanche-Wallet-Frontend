"use client";

import Image from "next/image";
import logo from "../../public/logo.svg";
import homeBG from "../../public/home-bg.svg";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { MdOutlineExitToApp } from "react-icons/md";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Loading from "./loading";
import { useEffect, useState } from "react";
import NProgress from "nprogress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Login } from "@/components/ui/login";
import { CreateAccount } from "@/components/ui/createAccount";
import { createAccount } from "@/lib/addressUtils";
import { setCookie } from "@/components/ui/cookies";
export default function Home() {
  return <HomeComp />;
}

const HomeComp = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
      className="w-full gap-5 h-dvh flex justify-center items-center flex-col  bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${homeBG.src})`
        // backgroundPosition: "center",
        // backgroundSize: "cover",
      }}
    >
      <Image src={logo} alt="*logo" width={143} height={126} />

      <div className="font-medium  w-full">
        <h1 className="text-center text-voilet text-2xl font-sans font-medium">
          Welcome to PsiFi
        </h1>
        <p className="text-dark-blue text-center uppercase text-sm/6">
          A new way to send, Spend and Secure
        </p>
      </div>

      <div className=" capitalize font-medium flex flex-col justify-center items-center gap-4 w-full">
        <DialogCreateAccount />
        <DialogLogin />
      </div>
    </div>
  );
};

export function DialogLogin() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="none"
          // onClick={() => router.push("/login", { scroll: false })}
          className="text-white sm:w-353px md: w-90 bg-gradient-button-bg font-normal tracking-wide text-sm flex justify-between px-10"
          style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
        >
          Login
          <MdOutlineExitToApp />
        </Button>
      </DialogTrigger>
      <DialogContent className=" bg-white h-modal-h w-90 max-w-modal-w">
        <Login />
        <DialogFooter className="sm:justify-start">
          {/* <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogCreateAccount() {
  const res = createAccount();
  setCookie("CreateAccountRes", res);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="none"
          // onClick={() => router.push("/login", { scroll: false })}
          className="text-white sm:w-353px md: w-90 bg-gradient-button-bg font-normal tracking-wide text-sm flex justify-between px-10"
          style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
        >
          New Account
          <FiPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className=" bg-white h-fit w-fit">
        <CreateAccount
          privateKey={res.privateKey}
          encryptedSeed={res.seed}
          publicKey={res.publicKey}
        />
        <DialogFooter className="sm:justify-start"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
