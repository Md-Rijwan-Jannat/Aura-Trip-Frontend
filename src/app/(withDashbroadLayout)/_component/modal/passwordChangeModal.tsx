'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ModalHeader,
} from '@nextui-org/modal';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@nextui-org/input';
import { FaLock } from 'react-icons/fa';
import { useChangePasswordMutation } from '@/src/redux/features/auth/authApi';
import GlassLoader from '@/src/components/shared/glassLoader';

const changePasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .nonempty('Email is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

type ChangePasswordFormInputs = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [changePasswordFn, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordFormInputs> = async (data) => {
    try {
      const res = await changePasswordFn(data).unwrap();

      if (res?.success) {
        toast.success('Password updated successfully!');
        onOpenChange();
        reset();
      }
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  return (
    <>
      <Button
        className="w-full primary-button"
        onPress={onOpen}
        startContent={<FaLock />}
      >
        Change Password
      </Button>
      <Modal
        size="md"
        placement="center"
        className="m-2"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="m-2">
          <ModalHeader>
            <h1 className="text-xl font-bold text-sage-600 dark:text-sage-400">Change Password</h1>
          </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  type="email"
                  {...register('email')}
                  variant="flat"
                  label="Email"
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
                <Input
                  type="password"
                  {...register('newPassword')}
                  variant="flat"
                  label="New Password"
                  placeholder="Enter your new password"
                  isInvalid={!!errors.newPassword}
                  errorMessage={errors.newPassword?.message}
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex items-center gap-8">
              <Button
                className="primary-button"
                type="submit"
                isDisabled={!isValid || isSubmitting || isLoading}
                isLoading={isSubmitting || isLoading}
              >
                Save
              </Button>
            </ModalFooter>
          </form>
          {isLoading && <GlassLoader />}
        </ModalContent>
      </Modal>
    </>
  );
}
