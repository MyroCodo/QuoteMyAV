interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all
                  ${
                    index < currentStep
                      ? 'bg-teal-500 text-white'
                      : index === currentStep
                      ? 'bg-teal-500 text-white ring-4 ring-teal-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  mt-2 text-sm font-medium
                  ${index <= currentStep ? 'text-white' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4
                  ${index < currentStep ? 'bg-teal-500' : 'bg-slate-700'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
