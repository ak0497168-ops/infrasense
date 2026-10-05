import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-4">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 border-2 ${
                    isDone
                      ? 'bg-sky-800 border-sky-800 text-white'
                      : isCurrent
                      ? 'bg-white border-sky-800 text-sky-800 ring-4 ring-sky-100'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                </div>
                <span
                  className={`text-xs mt-2 font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-sky-900 font-semibold'
                      : isDone
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors duration-200 ${
                    currentStep > stepNum ? 'bg-sky-800' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-semibold text-sky-900">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-slate-600 font-medium">
            {steps[currentStep - 1]?.name}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sky-800 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
