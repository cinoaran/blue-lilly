import {CircleCheckBig} from "lucide-react";
import React from "react";

interface FormSuccessProps {
  message?: string;
}

const FormSuccess = ({message}: FormSuccessProps) => {
  if (!message) return null;

  return (
    <p
      className={`flex items-start bg-primary w-full rounded-md text-white text-center p-2 mb-5`}
    >
      <span className="flex items-center justify-center gap-2">
        <CircleCheckBig width={20} height={20} />
        {message}
      </span>
    </p>
  );
};

export default FormSuccess;
