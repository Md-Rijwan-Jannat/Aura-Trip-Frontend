'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import { useStartPaymentProcessMutation } from '@/src/redux/features/payment/subscriptionsApi';
import { TPaymentData, TUser } from '@/src/types';
import { Button } from '@nextui-org/button';
import { Card, CardBody } from '@nextui-org/card';
import { Progress } from '@nextui-org/progress';
import { FaCrown, FaLock, FaBolt } from 'react-icons/fa';

interface PremiumModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  user: TUser | null;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onOpenChange,
  user,
}) => {
  const [startPaymentProcess, { isLoading }] = useStartPaymentProcessMutation();

  const handleSubscription = async () => {
    if (!user || user.verified) return;

    const paymentData: TPaymentData = {
      user: user._id!,
      amount: 1000, // Subscription amount
      customerName: user.name!,
      customerEmail: user.email!,
      customerAddress: user.address!,
      customerCountry: user.country || 'N/A',
      customerNumber: 'N/A',
    };

    try {
      const response = await startPaymentProcess({
        userId: user._id!,
        paymentData,
      }).unwrap();

      if (response.success && response.data.paymentResponse.payment_url) {
        window.location.href = response.data.paymentResponse.payment_url;
      }
    } catch (error) {
      console.error('Error starting payment process:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      classNames={{
        base: 'bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-800 dark:to-sage-900',
        header: 'border-b-0',
        footer: 'border-t-0',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1">
              <FaCrown className="text-5xl text-sage-600 dark:text-sage-400 mb-2" />
              <h2 className="text-2xl font-bold text-sage-700 dark:text-sage-300 dark:text-sage-400">
                Unlock Premium Access
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-6">
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Elevate your experience with exclusive content and features!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <Card className="bg-sage-200 dark:bg-sage-800">
                    <CardBody className="flex flex-col items-center p-4">
                      <FaLock className="text-3xl text-sage-700 dark:text-sage-300 dark:text-sage-400 mb-2" />
                      <p className="text-sm text-center">
                        Access Premium Posts
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="bg-sage-200 dark:bg-sage-800">
                    <CardBody className="flex flex-col items-center p-4">
                      <FaCrown className="text-3xl text-sage-700 dark:text-sage-400 mb-2" />
                      <p className="text-sm text-center">
                        Verified Profile Badge
                      </p>
                    </CardBody>
                  </Card>
                  <Card className="bg-sage-200 dark:bg-sage-800">
                    <CardBody className="flex flex-col items-center p-4">
                      <FaBolt className="text-3xl text-sage-700 dark:text-sage-300 dark:text-sage-400 mb-2" />
                      <p className="text-sm text-center">Exclusive Features</p>
                    </CardBody>
                  </Card>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Upgrade Progress
                  </p>
                  <Progress
                    color="danger"
                    aria-label="Upgrade progress"
                    value={60}
                    className="h-2"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="w-full primary-button "
                onPress={handleSubscription}
                isLoading={isLoading}
                startContent={
                  !isLoading && (
                    <FaCrown className="text-yellow-300" size={16} />
                  )
                }
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PremiumModal;
