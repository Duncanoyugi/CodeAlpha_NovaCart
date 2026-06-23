import React from 'react';
import { Package, Truck, CreditCard, Check } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: number;
  steps: string[];
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep, steps }) => {
  const icons = [Package, Truck, CreditCard];

  return (
    <div className="mb-10">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const Icon = icons[index];

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[var(--color-gold-500)] border-[var(--color-gold-500)] text-white shadow-[var(--shadow-gold)]' :
                  isCurrent ? 'border-[var(--color-gold-400)] text-[var(--color-gold-600)] bg-[var(--color-gold-50)] shadow-sm' :
                  'border-[var(--color-border-medium)] text-[var(--color-text-tertiary)] bg-[var(--color-bg-raised)]'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2.5 font-ui text-[10px] uppercase tracking-[0.12em] font-bold ${
                  isCompleted || isCurrent ? 'text-[var(--color-gold-600)]' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-3 mt-[-22px] transition-colors duration-300 rounded-full overflow-hidden bg-[var(--color-border-light)]">
                  <div className={`h-full rounded-full transition-all duration-500 ${index < currentStep ? 'bg-[var(--color-gold-500)] w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
