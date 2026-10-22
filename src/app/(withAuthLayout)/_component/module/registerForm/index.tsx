"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@nextui-org/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import RegisterRightContent from "./registerRightContent";
import GoogleButton from "./googleButton";

import { registerSchema } from "@/src/schema/auth";
import { primaryColor } from "@/src/styles/button";
import { useRegisterMutation } from "@/src/redux/features/auth/authApi";
import { useAppDispatch } from "@/src/redux/hook";
import { setCredentials } from "@/src/redux/features/auth/authSlice";
import GlassLoader from "@/src/components/shared/glassLoader";
import Cookies from "js-cookie";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import BackButton from "../../ui/backButton";
import { Button } from "@nextui-org/button";
import BrandLogo from "@/src/components/shared/logo";

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const [registerUser, { isLoading: RegisterLoading, isSuccess }] =
    useRegisterMutation();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const res = await registerUser(data);

      if (res?.data?.success && res?.data?.data?.accessToken) {
        const userData = {
          id: res.data.data.result._id,
          email: res.data.data.result.email,
          role: res.data.data.result.role,
        };

        dispatch(
          setCredentials({ user: userData, token: res.data.data.accessToken })
        );

        router.push(redirect ? redirect : "/news-feed/posts");

        Cookies.set("accessToken", res?.data?.data?.accessToken);
        toast.success("Register successful");
      } else {
        const error = res?.error;

        if (error) {
          // Check if error is of type FetchBaseQueryError
          if ("data" in (error as FetchBaseQueryError)) {
            const fetchError = error as FetchBaseQueryError;
            const errorMessage = (fetchError.data as { message?: string })
              ?.message;

            if (errorMessage) {
              toast.error(errorMessage);
            } else {
              toast.error("An unknown error occurred");
            }
          } else if ((error as SerializedError).message) {
            toast.error((error as SerializedError).message!);
          } else {
            toast.error("An unknown error occurred");
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full min-h-[100svh] flex items-center justify-center max-w-7xl py-6 md:py-10">
      {/* Conditionally render the GlassLoader */}
      {RegisterLoading && <GlassLoader />}
      <div className="flex flex-col items-stretch w-full">
        <div className="flex flex-row gap-3 w-full items-center justify-center">
          <BackButton />
        </div>
        <div className="flex flex-col-reverse md:flex-row bg-default-100 border border-default-200 rounded-2xl md:rounded-xl w-full max-w-5xl mx-auto overflow-hidden mt-4 shadow-sm md:shadow-none">
          {/* Left side - Form Section */}
          <div className="w-full md:flex-1 md:min-w-0 flex flex-col justify-center">
            <div className="flex flex-col gap-6 px-4 py-6 sm:px-7 sm:py-8 md:px-12 md:py-12">
             
              <div className="flex flex-col items-center gap-4 w-full">
                <GoogleButton redirect={redirect} />
                <div className="flex items-center gap-3 w-full" role="separator" aria-orientation="horizontal">
                  <div className="flex-1 h-px bg-default-200" />
                  <span className="text-default-400 text-xs">or</span>
                  <div className="flex-1 h-px bg-default-200" />
                </div>
              </div>
              {/* Form Fields */}
              <form
                className="w-full flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="h-16">
                  <Input
                    {...register("name")}
                    className="font-semibold"
                    isInvalid={!!errors.name}
                    label="Name"
                    placeholder="What shall we call you?"
                    type="text"
                    validationState={errors.name ? "invalid" : undefined}
                    variant="underlined"
                  />
                  {errors.name && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="h-16">
                  <Input
                    {...register("email")}
                    className="font-semibold"
                    isInvalid={!!errors.email}
                    label="Email address"
                    placeholder="you@domain.com"
                    type="email"
                    validationState={errors.email ? "invalid" : undefined}
                    variant="underlined"
                  />
                  {errors.email && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="h-16">
                  <Input
                    {...register("password")}
                    className="font-semibold"
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                      >
                        {isVisible ? (
                          <IoEyeOffOutline className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <IoEyeOutline className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    isInvalid={!!errors.password}
                    label="Password"
                    placeholder="Must be at least 8 characters"
                    type={isVisible ? "text" : "password"}
                    validationState={errors.password ? "invalid" : undefined}
                    variant="underlined"
                  />
                  {errors.password && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    className="secondary-button min-w-[240px] sm:min-w-[280px]"
                    isLoading={RegisterLoading}
                    disabled={RegisterLoading}
                    type="submit"
                  >
                    {RegisterLoading ? "Register..." : "Register"}
                  </Button>
                </div>
              </form>

              <p className="text-center text-default-500 text-xs relative">
                Already have an account?{" "}
                <Link className="text-blue-500 text-xs" href="/login">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Right side - Info Section with rainbow blur background */}
          <RegisterRightContent />
        </div>
      </div>
    </div>
  );
}
