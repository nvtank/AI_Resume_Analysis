import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";
import { FaChevronDown } from "react-icons/fa6"; // Using react-icons for cleaner look

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider
      value={{ activeItems, toggleItem, isItemActive }}
    >
      <div className={cn("space-y-4", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className = "",
}) => {
  return (
    <div className={cn("overflow-hidden border border-[var(--color-border)] rounded-2xl bg-white", className)}>
      {children}
    </div>
  );
};

interface AccordionHeaderProps {
  itemId: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  const defaultIcon = (
    <FaChevronDown
      className={cn("w-4 h-4 transition-transform duration-300 text-[var(--color-text-secondary)]", {
        "rotate-180": isActive,
      })}
    />
  );

  const handleClick = () => {
    toggleItem(itemId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full px-6 py-4 text-left focus:outline-none transition-colors duration-200 flex items-center justify-between cursor-pointer hover:bg-[var(--color-bg-secondary)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {iconPosition === "left" && (icon || defaultIcon)}
        <div className="flex-1 font-medium text-[var(--color-text-primary)]">{children}</div>
      </div>
      {iconPosition === "right" && (icon || defaultIcon)}
    </button>
  );
};

interface AccordionContentProps {
  itemId: string;
  children: ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  itemId,
  children,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className={cn("overflow-hidden", className)}>
        <div className="px-6 pb-6 pt-2 text-[var(--color-text-secondary)]">{children}</div>
      </div>
    </div>
  );
};