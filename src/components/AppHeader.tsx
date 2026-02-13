"use client";

import React from "react";

type AppHeaderProps = {
  children?: React.ReactNode;
};

export const AppHeader = ({ children }: AppHeaderProps) => {
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 px-6 border-b bg-background/80 backdrop-blur-sm shadow-sm">
      {children}
    </header>
  );
};

type AppHeaderTitleProps = {
  title?: string;
  description?: string;
};

export const AppHeaderTitle = ({ title, description }: AppHeaderTitleProps) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-lg font-semibold">{title}</h1>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

type AppHeaderActionsProps = {
  children: React.ReactNode;
};

export const AppHeaderActions = ({ children }: AppHeaderActionsProps) => {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
};

export default AppHeader;
