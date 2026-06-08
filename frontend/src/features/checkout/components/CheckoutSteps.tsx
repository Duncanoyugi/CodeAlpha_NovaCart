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
              <div className="flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[var(--color-gold-400)] border-[var(--color-gold-400)] text-[var(--color-gold-800)]' :
                  isCurrent ? 'border-[var(--color-gold-400)] text-[var(--color-gold-400)] bg-[var(--color-gold-50)]' :
                  'border-[var(--color-border-medium)] text-[var(--color-text-tertiary)] bg-[var(--color-bg-surface)]'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 font-ui text-[11px] uppercase tracking-[0.08em] ${
                  isCompleted || isCurrent ? 'text-[var(--color-gold-600)] font-bold' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-20px] transition-colors duration-300 ${
                  index < currentStep ? 'bg-[var(--color-gold-400)]' : 'bg-[var(--color-border-light)]'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
