import type { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      {children}
    </div>
  );
};
