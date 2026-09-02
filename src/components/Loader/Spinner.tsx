import React from "react";

const Spinner = ({label}: {label?: string}) => {
  return (
    <div className="flex items-center justify-center gap-4 ">
      <div className="flex items-center justify-center h-20">{label}</div>
      <div className="relative h-6">
        <div
          className="w-6 h-6 rounded-full absolute
                            border-4 border-solid destructive-foreground border-t-transparent animate-spin z-50"
        ></div>
      </div>
    </div>
  );
};

export default Spinner;
