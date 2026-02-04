'use client';
import { createContext, useState } from 'react';

type PrimaryNavigationStateType = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
};

export const PrimaryNavigationContext =
  createContext<PrimaryNavigationStateType>({
    visible: false,
    setVisible: (_) => {},
    isFocused: false,
    setIsFocused: (_) => {},
  });

export default function PrimaryNavigationProvider({
  value,
  children,
}: {
  value?: boolean;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState<boolean>(value ?? false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <PrimaryNavigationContext.Provider
      value={{ visible, setVisible, isFocused, setIsFocused }}
    >
      {children}
    </PrimaryNavigationContext.Provider>
  );
}
