import { useState, useImperativeHandle, forwardRef } from "react";

interface AnimatedSendButtonProps {
  onSuccess?: () => void;
  sendText?: string;
  successText?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  bgColor?: string;
  borderColor?: string;
  loaderColor?: string;
  successTextColor?: string;
}

export interface AnimatedSendButtonRef {
  triggerAnimation: () => void;
  reset: () => void;
}

const AnimatedSendButton = forwardRef<
  AnimatedSendButtonRef,
  AnimatedSendButtonProps
>(
  (
    {
      onSuccess,
      sendText = "SEND",
      successText = "SUCCESS",
      className = "",
      disabled = false,
      type = "submit",
      bgColor = "var(--color-primary)",
      borderColor = "white",
      loaderColor = "white",
      successTextColor = "white",
    },
    ref
  ) => {
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const triggerAnimation = () => {
      if (isActive || disabled) return;

      setIsActive(true);

      // After 1.8s, set finished state
      setTimeout(() => {
        setIsFinished(true);

        // Call success callback after finish animation
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      }, 1800);
    };

    const reset = () => {
      setIsActive(false);
      setIsFinished(false);
    };

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        triggerAnimation,
        reset,
      }),
      [isActive, disabled, onSuccess]
    );

    return (
      <button
        type={type}
        disabled={disabled}
        className={`
                relative overflow-hidden
                border-2
                text-white font-bold
                rounded-[50px]
                transition-all
                ${isActive && !isFinished ? "py-0 px-20" : "py-[15px] px-20"}
                ${isFinished ? "py-[15px] px-20" : ""}
                focus:outline-none
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:opacity-90"
                }
                ${className}
            `}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          transitionDuration: "400ms",
          transitionTimingFunction: "cubic-bezier(0.35, -0.77, 0.67, 1.88)",
        }}
      >
        {/* SEND Text */}
        <span
          className={`
                    block
                    transition-all
                    ${
                      isActive
                        ? "scale-0 -translate-y-[350%] opacity-0"
                        : "scale-100 translate-y-0 opacity-100"
                    }
                `}
          style={{
            transitionDuration: "350ms",
            transitionTimingFunction: "cubic-bezier(0.34, -0.61, 1, 0.64)",
          }}
        >
          {sendText}
        </span>

        {/* Loader Bar */}
        <div
          className={`
                    absolute left-[2px] top-[2px]
                    h-[calc(100%-4px)]
                    rounded-[50px]
                    transition-all ease-in-out
                    ${isActive ? "w-[calc(100%-4px)]" : "w-[calc(0%-4px)]"}
                `}
          style={{
            backgroundColor: loaderColor,
            transitionDuration: "1300ms",
            transitionDelay: isActive ? "500ms" : "0ms",
          }}
        />

        {/* SUCCESS Text */}
        <span
          className={`
                    absolute
                    top-1/2
                    left-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                    transition-all
                    ${
                      isFinished ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }
                `}
          style={{
            color: successTextColor,
            transitionDuration: "400ms",
            transitionDelay: isFinished ? "100ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.34, -0.61, 1, 0.64)",
          }}
        >
          {successText}
        </span>
      </button>
    );
  }
);

AnimatedSendButton.displayName = "AnimatedSendButton";

export default AnimatedSendButton;
