import {CircleAlertIcon} from "lucide-react";
import React from "react";

interface FormErrorProps {
  message?: string;
}

const FormError = ({message}: FormErrorProps) => {
  if (!message) return null; // Return null if the message prop is empty

  return (
    <p
      className={`flex items-start justify-center rounded-md bg-destructive text-md text-center p-2 mb-5 min-w-full`}
    >
      <span className="flex items-center justify-center gap-2 text-destructive-foreground">
        <CircleAlertIcon size={12} />
        {message}
      </span>
    </p>
  );
};

export default FormError;
