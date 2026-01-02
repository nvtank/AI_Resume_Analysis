import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "../../lib/utils"; // Assuming utils exists, if not I will use a simple class joiner or clsx directly

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  isLoading,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: "power1.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power1.out",
      });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
      // Kill tweaks to avoid memory leaks
      gsap.killTweensOf(button);
    };
  }, []);

  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 focus:ring-black",
    secondary: "bg-white text-black border border-gray-200 hover:bg-gray-50 focus:ring-gray-200",
    ghost: "bg-transparent text-black hover:bg-gray-100 focus:ring-gray-200",
  };

  const sizes = "h-12 px-8 py-3 text-base";

  return (
    <button
      ref={buttonRef}
      className={cn(baseStyles, variants[variant], sizes, className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
