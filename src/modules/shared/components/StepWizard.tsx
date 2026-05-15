import React from "react";
import { Button, Spinner } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  content: React.ReactNode;
  optional?: boolean;
  completed?: boolean;
  error?: boolean;
}

// ─── StepWizard ──────────────────────────────────────────────────────────────

interface StepWizardProps {
  steps: StepItem[];
  activeStep: number;
  onStepChange: (step: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  activeStep,
  onStepChange,
  orientation = "horizontal",
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={`nk-wizard ${className}`}>
      <div
        className={`d-flex ${isHorizontal ? "align-items-center mb-4" : "flex-column me-4"}`}
        style={{ gap: isHorizontal ? 0 : "0.5rem" }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = step.completed || index < activeStep;
          const isError = step.error;

          let circleColor = "light";
          let textColor = "text-muted";
          if (isError) {
            circleColor = "danger";
            textColor = "text-danger";
          } else if (isActive) {
            circleColor = "primary";
            textColor = "text-primary";
          } else if (isCompleted) {
            circleColor = "success";
            textColor = "text-success";
          }

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={
                    isHorizontal
                      ? "flex-grow-1 mx-2"
                      : "ms-3 my-1"
                  }
                  style={
                    isHorizontal
                      ? { height: 2, backgroundColor: isCompleted ? "var(--bs-success)" : "#e5e9f2" }
                      : { width: 2, height: 24, backgroundColor: isCompleted ? "var(--bs-success)" : "#e5e9f2" }
                  }
                />
              )}
              <div
                className={`d-flex ${isHorizontal ? "flex-column align-items-center" : "align-items-center"}`}
                style={{ cursor: "pointer", minWidth: isHorizontal ? 80 : undefined }}
                onClick={() => onStepChange(index)}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center bg-${circleColor} ${circleColor === "light" ? "text-muted" : "text-white"}`}
                  style={{ width: 36, height: 36, flexShrink: 0 }}
                >
                  {isCompleted && !isActive ? (
                    <Icon name="check" />
                  ) : isError ? (
                    <Icon name="alert-circle" />
                  ) : step.icon ? (
                    <Icon name={step.icon} />
                  ) : (
                    <span className="fw-bold small">{index + 1}</span>
                  )}
                </div>
                <div className={isHorizontal ? "mt-2 text-center" : "ms-2"}>
                  <span className={`small fw-medium ${textColor}`}>{step.label}</span>
                  {step.description && (
                    <span className="d-block sub-text" style={{ fontSize: 11 }}>
                      {step.description}
                    </span>
                  )}
                  {step.optional && (
                    <span className="d-block text-soft" style={{ fontSize: 10 }}>
                      İsteğe bağlı
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className={`nk-wizard-content ${isHorizontal ? "" : "flex-grow-1"}`}>
        {steps[activeStep]?.content}
      </div>
    </div>
  );
};

// ─── StepNavigation ──────────────────────────────────────────────────────────

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onFinish,
  nextLabel = "İleri",
  prevLabel = "Geri",
  finishLabel = "Tamamla",
  loading = false,
  nextDisabled = false,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between">
      <Button color="light" outline onClick={onPrev} disabled={isFirst || loading}>
        <Icon name="arrow-left" />
        <span className="ms-1">{prevLabel}</span>
      </Button>

      {isLast ? (
        <Button
          color="primary"
          onClick={onFinish || onNext}
          disabled={nextDisabled || loading}
        >
          {loading && <Spinner size="sm" className="me-1" />}
          {finishLabel}
          <Icon name="check" className="ms-1" />
        </Button>
      ) : (
        <Button
          color="primary"
          onClick={onNext}
          disabled={nextDisabled || loading}
        >
          {loading && <Spinner size="sm" className="me-1" />}
          <span className="me-1">{nextLabel}</span>
          <Icon name="arrow-right" />
        </Button>
      )}
    </div>
  );
};

export { StepWizard, StepNavigation };
export type { StepItem, StepWizardProps, StepNavigationProps };
