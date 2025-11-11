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

      // After loader bar finishes (500ms delay + 1300ms transition = 1800ms)
      setTimeout(() => {
        setIsFinished(true);

        // Call success callback after SUCCESS text appears and stays visible
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 800); // Give time to see SUCCESS text
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
        className={`relative overflow-hidden border-2 text-white font-bold focus:outline-none ${className}`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderRadius: '50px',
          paddingTop: isActive && !isFinished ? '0px' : '15px',
          paddingBottom: isActive && !isFinished ? '0px' : '15px',
          paddingLeft: '80px',
          paddingRight: '80px',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 400ms cubic-bezier(0.35, -0.77, 0.67, 1.88)',
          transform: 'translateZ(0)',
        }}
      >
        {/* SEND Text */}
        <span
          style={{
            display: 'block',
            transform: isActive 
              ? 'scale(0) translateY(-350%)' 
              : 'scale(1) translateY(0)',
            opacity: isActive ? 0 : 1,
            transition: 'all 350ms cubic-bezier(0.34, -0.61, 1, 0.64)',
          }}
        >
          {sendText}
        </span>

        {/* Loader Bar */}
        <div
          style={{
            position: 'absolute',
            left: '2px',
            top: '2px',
            height: 'calc(100% - 4px)',
            width: isActive ? 'calc(100% - 4px)' : '0',
            borderRadius: '50px',
            backgroundColor: loaderColor,
            transition: 'all 1300ms ease-in-out',
            transitionDelay: isActive ? '500ms' : '0ms',
            transform: 'translateZ(0)',
          }}
        />

        {/* SUCCESS Text */}
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: isFinished 
              ? 'translate(-50%, -50%) scale(1)' 
              : 'translate(-50%, -50%) scale(0)',
            opacity: isFinished ? 1 : 0,
            color: successTextColor,
            transition: 'all 400ms cubic-bezier(0.34, -0.61, 1, 0.64)',
            transitionDelay: isFinished ? '100ms' : '0ms',
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
