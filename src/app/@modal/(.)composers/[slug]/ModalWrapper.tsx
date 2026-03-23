"use client";

import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

export default function ModalWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  // Clone the child and inject the onClose prop
  const childrenWithClose = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, { onClose: handleClose });
    }
    return child;
  });

  return <>{childrenWithClose}</>;
}
