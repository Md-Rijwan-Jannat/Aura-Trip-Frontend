'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@nextui-org/input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import React from 'react';
import GlassLoader from '@/src/components/shared/glassLoader';
import BrandLogo from '@/src/components/shared/logo';
import { resetPasswordSchema } from '@/src/schema/auth';
import { Button } from '@nextui-org/button';
import { useForgetPasswordMutation } from '@/src/redux/features/auth/authApi';

type TForgetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export default function ForgetPasswordForm() {
  const [forgetPasswordFn, { isLoading: forgetPasswordIsLoading }] =
    useForgetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const resetToken = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TForgetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: TForgetPasswordFormInputs) => {
    try {
      const res = await forgetPasswordFn({
        email: email,
        newPassword: data.password,
        token: resetToken,
      });

      if (res?.data?.success) {
        toast.success('Password has been successfully reset. Please log in.');
        router.push('/login');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-[100svh] flex items-center justify-center max-w-7xl py-6 md:py-10">
      {forgetPasswordIsLoading && <GlassLoader />}
      <div className="w-full max-w-md mx-auto bg-default-100 border border-default-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Brand header — logo centered inside the card */}
        <div className="flex justify-center px-5 pt-6 pb-1 sm:pt-7">
          <Link aria-label="Aura Trip home" href="/">
            <BrandLogo />
          </Link>
        </div>
        <div className="flex flex-col gap-6 px-5 pb-7 pt-3 sm:px-8 sm:pb-8 bg-default-50/60 md:bg-transparent">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Reset Password</h2>
            <p className="text-default-500 text-sm leading-relaxed">
              Enter your new password. It must be at least 8 characters long.
            </p>
          </div>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="h-16">
              <Input
                {...register('password')}
                className="font-semibold"
                isInvalid={!!errors.password}
                label="New Password"
                placeholder="Enter your new password"
                type="password"
                validationState={errors.password ? 'invalid' : undefined}
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
                type="submit"
              >
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
