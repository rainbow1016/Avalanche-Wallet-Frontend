"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FaUserLarge } from "react-icons/fa6";
import { FaUnlockAlt } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { afterLogin, createAccount, getSeed } from "@/lib/addressUtils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import { setCookie } from "@/components/ui/cookies";

export function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);

  const formSchema = z.object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters."
    }),
    password: z.string().min(8, {
      message: "password must be at least 8 characters."
    }),
    message: z.string().min(0, {
      message: "Invalid Credentials"
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      message: ""
    }
  });

  const { errors } = form.formState;

  async function onSubmit(values) {
    try {
      setLoading(true);
      const appUrl = `${process.env.NEXT_PUBLIC_HOST}/api/auth`;
      const response = await fetch(appUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Update form error for username or password
          form.setError("message", {
            type: "manual",
            message: "Invalid credentials"
          });
        } else if (response.status === 500) {
          // Update form error for a general server error
          form.setError("message", {
            type: "manual",
            message: "Server error. Please try again later."
          });
        } else {
          // Update form error for other status codes
          form.setError("message", {
            type: "manual",
            message:
              response.status == 405
                ? "Something went wrong ,Try again"
                : "Something went wrong ,Try again"
          });
        }

        // Throw an error if needed
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      let pass = form.getValues();
      const res = afterLogin(data.rootSeed, data.salt, pass.password);
      setCookie("afterLoginRes", res);
      if (response.ok) {
        setLoading(false);
        router.push("/wallet");
      }
    } catch (error) {
      // Handle specific errors and set corresponding error messages
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-0 py-0 h-full bg-white w-full flex flex-col justify-center gap-4 items-center ">
      <p className="font-sans text-lg text-voilet font-medium tracking-wide">
        Login
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4  w-full "
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl className="w-full bg-white">
                  <div className="border-grey border-2 w-100  flex items-center justify-around">
                    <FaUserLarge className="w-10 px-1 text-voilet" />
                    <Input
                      className="w-100 border-none rounded-none placeholder:text-navy-blue focus:outline-none active:outline-none outline-0 bg-transparent"
                      style={{
                        boxShadow: "none",
                        backgroundColor: "transparent"
                      }}
                      placeholder="User Name"
                      type="text"
                      id="name"
                      name="name"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="border-grey border-2 w-full relative flex items-center justify-around">
                    <FaUnlockAlt className="w-10 px-1  text-voilet" />
                    <Input
                      className="w-90 rounded-none border-none placeholder:text-navy-blue"
                      style={{ boxShadow: "none" }}
                      placeholder="Password"
                      type={!toggle ? "password" : "text"}
                      id="password"
                      name="password"
                      {...field}
                    />
                    <div
                      onClick={() => setToggle(!toggle)}
                      className="text-voilet absolute right-1 cursor-pointer"
                    >
                      {toggle ? <FaEye /> : <FaEyeSlash />}
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-navy-blue text-xs font-normal cursor-pointer hover:opacity-50">
                  Forgot Password?
                </FormDescription>
                <FormMessage className="text-error">
                  {errors?.message?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <CustomBtn
            onClick={onSubmit}
            isFormValid={form.formState.isValid}
            loading={loading}
          />
        </form>
      </Form>
    </div>
    // </div>
  );
}

const CustomBtn = ({ onSubmit, isFormValid, loading }) => {
  const router = useRouter();
  return (
    <div className=" w-full flex justify-center">
      <Button
        variant="none"
        disabled={!isFormValid || loading}
        onClick={onSubmit}
        className="text-white w-3/4 bg-gradient-button-bg font-normal tracking-wide text-base"
        style={{ clipPath: "polygon(9% 0, 97% -5%, 90% 100%, 1% 100%)" }}
      >
        {!loading ? (
          "Submit"
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
    </div>
  );
};
