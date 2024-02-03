"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { GoCopy } from "react-icons/go";
import { FaCheck } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { afterLogin, encryptKey } from "@/lib/addressUtils";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCookie, setCookie } from "./cookies";

export const CreateAccount = ({ privateKey, encryptedSeed, publicKey }) => {
  const router = useRouter();
  const [copyStatus, setCopyStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  let encryptedKey;
  const notify = () =>
    toast.error("User Already Exist Please Login", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light"
    });
  const handleCopyClick = () => {
    setCopyStatus(true);
    navigator.clipboard.writeText(privateKey);
    setTimeout(() => {
      setCopyStatus(false);
    }, 3000);
  };

  const formSchema = z.object({
    username: z.string().min(4, {
      message: "Username must be at least 2 characters."
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters."
    }),
    confirm_password: z
      .string()
      .min(8, {
        message: "Confirm password must be at least 8 characters."
      })
      .transform((data) => {
        if (form.formState.isValid) {
        }
        if (data.confirm_password !== data.password) {
          throw new Error("Passwords do not match.");
        }
        return data.confirm_password;
      }),
    agreement: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions."
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirm_password: "",
      agreement: false
    }
  });

  async function onSubmit() {
    setLoading(true);
    try {
      const values = form.getValues();
      encryptedKey = encryptKey(values.password, encryptedSeed);
      setCookie("encryptKeyRes", encryptedKey);

      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          rootSeed: getCookie("encryptKeyRes").encryptedSeed,
          salt: getCookie("encryptKeyRes").salt,
          publicKey: publicKey
        })
      });

      if (!response.ok) {
        // Handle specific HTTP error codes
        if (response.status === 400) {
          notify();
          console.error("Unauthorized: Invalid credentials");
        } else if (response.status === 500) {
          console.error("Server error. Please try again later.");
        } else {
          console.error(`Server responded with status: ${response.status}`);
        }

        // You might want to throw an error here if needed
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        const res = afterLogin(data.rootSeed, data.salt, values.password);
        setCookie("afterLoginRes", res);
        router.push("/wallet");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // You can handle the error and update the UI accordingly
    } finally {
      let encryptKeyRes = getCookie("encryptKeyRes");
      if (encryptKeyRes) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div className="w-100   h-full p-0">
        <h1 className="text-voilet w-full font-medium text-xl text-left">
          Create Wallet
        </h1>

        <div className="bg-gradient-button-bg p-4 text-white w-full sm:max-w-modal-w mt-2">
          <p className="tracking-wider">Warning</p>
          <p className=" mt-2 text-base font-normal tracking-wide">
            Write down your private key and keed it in safe place as you will
            not be able to retrieve it.
          </p>
        </div>

        <div className="border-grey border-2 text-navy-blue p-4 max-w-modal-w flex justify-between mt-2">
          <p className=" mt-2 text-base font-normal tracking-wide w-3/4 truncate ">
            {privateKey}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={() => handleCopyClick()}>
                {!copyStatus ? (
                  <GoCopy className="text-base text-voilet" />
                ) : (
                  <FaCheck className="text-green" />
                )}
              </TooltipTrigger>
              <TooltipContent className="bg-white border-none">
                <p className="text-black">copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="max-w-modal-w">
          <Register form={form} formSchema={formSchema} onSubmit={onSubmit} />
        </div>
      </div>
      <div className=" flex justify-center gap-2 w-full overflow-visible">
        <CustomBtn
          loading={loading}
          isFormValid={form.formState.isValid}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
};

const Register = ({ formSchema, form, onSubmit }) => {
  const router = useRouter();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 w-100 mt-2"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  autoComplete="username"
                  className=" border-grey border-2 rounded-none placeholder:text-navy-blue focus:outline-none active:outline-none outline-0 bg-transparent h-12"
                  style={{
                    boxShadow: "none",
                    backgroundColor: "transparent"
                  }}
                  placeholder="Input your unique Username"
                  type="text"
                  id="name"
                  name="name"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl className="bg-white">
                <Input
                  autoComplete="current-password"
                  className=" border-grey border-2 rounded-none placeholder:text-navy-blue focus:outline-none active:outline-none outline-0 bg-transparent  h-12"
                  style={{
                    boxShadow: "none",
                    backgroundColor: "transparent"
                  }}
                  placeholder="Enter Password"
                  type="password"
                  id="password"
                  name="password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormControl className="bg-white">
                <Input
                  className=" border-grey border-2 rounded-none placeholder:text-navy-blue placeholder:text-sm  focus:outline-none active:outline-none outline-0 bg-transparent  h-12"
                  style={{
                    boxShadow: "none",
                    backgroundColor: "transparent"
                  }}
                  placeholder="Confirm Password"
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agreement"
          render={({ field }) => (
            <FormItem>
              <FormControl className="bg-none">
                <div className="flex justify-start w-100 bg-none">
                  <Input
                    className=" w-1/6 rounded-none bg-transparent h-5 "
                    style={{
                      boxShadow: "none",
                      backgroundColor: "transparent"
                    }}
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    {...field}
                  />
                  <label className="text-sm">
                    I have written down my private key and understand I will not
                    be able to retrieve it
                  </label>
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

const CustomBtn = ({ onSubmit, isFormValid, loading }) => {
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
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="flex justify-center items-center mt-1"
          >
            <Button
              variant="none"
              onClick={() => router.push("/")}
              className="text-voilet font-normal tracking-wide text-base"
            >
              Cancel
            </Button>
          </div>
        </foreignObject>
      </svg>

      <Button
        variant="none"
        disabled={!isFormValid || loading}
        onClick={onSubmit}
        className="text-white w-36 h-15 bg-gradient-button-bg font-normal tracking-wide text-base"
        style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
      >
        {!loading ? (
          "Register"
        ) : (
          <HashLoader
            color="#fff"
            loading={loading}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        )}
      </Button>
    </>
  );
};
