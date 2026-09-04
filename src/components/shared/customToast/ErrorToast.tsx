import {AlertOctagon} from "lucide-react";
import React, {useEffect} from "react";

interface ErrorToastProps {
  message?: string;
  /** milliseconds until the toast auto-closes (defaults to 4000) */
  duration?: number;
  /** called when the toast should be closed (parent should clear the message) */
  onClose?: () => void;
}

const ErrorToast = ({message, duration = 4000, onClose}: ErrorToastProps) => {
  useEffect(() => {
    if (!message) return;
    if (!onClose) return;
    const t = setTimeout(() => {
      try {
        onClose();
      } catch (e) {
        // ignore
      }
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="flex items-start bg-destructive w-full rounded-md text-white text-center p-2 mb-5">
      <span className="flex items-center justify-center gap-2">
        <AlertOctagon width={20} height={20} />
        {message}
      </span>
    </div>
  );
};

export default ErrorToast;
