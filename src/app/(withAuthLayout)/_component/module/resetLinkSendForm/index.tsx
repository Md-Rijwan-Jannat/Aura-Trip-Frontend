'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@nextui-org/input';
import Link from 'next/link';
import { toast } from 'sonner';
import React from 'react';
import GlassLoader from '@/src/components/shared/glassLoader';
import BrandLogo from '@/src/components/shared/logo';
import { Button } from '@nextui-org/button';
import { useResetLinkMutation } from '@/src/redux/features/auth/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Define schema using Zod for validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetLinkSendFormInputs = z.infer<typeof forgotPasswordSchema>;

export default function ResetLinkSendForm() {
  const [sendResetLink, { isLoading: forgotPasswordIsLoading }] =
    useResetLinkMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetLinkSendFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ResetLinkSendFormInputs) => {
    try {
      const res = await sendResetLink(data);

      if ('data' in res && res.data.success) {
        toast.success('Password reset email sent. Please check your inbox.');
      } else {
        const error = res.error;

        if (error) {
          if ('data' in (error as FetchBaseQueryError)) {
            const fetchError = error as FetchBaseQueryError;
            const errorMessage = (fetchError.data as { message?: string })
              ?.message;

            if (errorMessage) {
              toast.error(errorMessage);
            } else {
              toast.error('An unknown error occurred');
            }
          } else if ((error as SerializedError).message) {
            toast.error((error as SerializedError).message!);
          } else {
            toast.error('An unknown error occurred');
          }
        }
      }
    } catch (error) {
      console.error(error); // Updated to use console.error
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-[100svh] flex items-center justify-center max-w-7xl py-6 md:py-10">
      {forgotPasswordIsLoading && <GlassLoader />}
      <div className="w-full max-w-md mx-auto bg-default-100 border border-default-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Brand header — logo centered inside the card */}
        <div className="flex justify-center px-5 pt-6 pb-1 sm:pt-7">
          <Link aria-label="Aura Trip home" href="/">
            <BrandLogo />
          </Link>
        </div>
        <div className="flex flex-col gap-6 px-5 pb-7 pt-3 sm:px-8 sm:pb-8">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">
              Forgot your password?
            </h2>
            <p className="text-default-500 text-sm leading-relaxed">
              Enter your email address and we will send you a link to reset
              your password.
            </p>
          </div>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="h-16">
              <Input
                {...register('email')}
                className="font-semibold"
                isInvalid={!!errors.email}
                label="Email address"
                placeholder="you@domain.com"
                type="email"
                validationState={errors.email ? 'invalid' : undefined}
                variant="underlined"
              />
              {errors.email && (
                <p className="text-danger-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                className="secondary-button min-w-[240px] sm:min-w-[280px]"
                type="submit"
              >
                Send Reset Link
              </Button>
            </div>
          </form>

          <p className="text-center text-default-500 text-sm border-t border-default-200 pt-4 relative">
            Remembered your password?{' '}
            <Link className="text-blue-500 text-sm font-medium" href="/login">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
