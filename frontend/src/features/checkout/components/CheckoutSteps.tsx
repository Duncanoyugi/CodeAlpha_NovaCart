import React from 'react';
import { Check, Truck, CreditCard, Package } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: number;
  steps: string[];
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep, steps }) => {
  const icons = [Package, Truck, CreditCard];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const Icon = icons[index];

          return (
            <div key={step} className="flex-1 text-center">
              <div className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                    style={{ transform: 'translateX(0%)' }}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`
                    relative z-10 w-10 h-10 mx-auto rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted ? 'bg-primary-500 text-white' : ''}
                    ${isCurrent ? 'bg-primary-100 border-2 border-primary-500 text-primary-500' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    Icon && <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`
                    mt-2 text-sm font-medium
                    ${isCompleted || isCurrent ? 'text-primary-600' : 'text-gray-400'}
                  `}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};