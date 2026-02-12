import Image from "next/image";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  // Check if children is an array and separate footer from form content
  const childrenArray = Array.isArray(children) ? children : [children];
  const footerElement = childrenArray.find(
    (child) =>
      child &&
      typeof child === "object" &&
      "props" in child &&
      child.props?.className?.includes("auth-footer"),
  );
  const formContent = childrenArray.filter(
    (child) =>
      !(
        child &&
        typeof child === "object" &&
        "props" in child &&
        child.props?.className?.includes("auth-footer")
      ),
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <Card className="w-full max-w-[30.8rem] min-h-[600px] shadow-xl">
          <CardHeader className="text-center pt-4 pb-0">
            <div className="flex justify-center mb-0">
              <Image
                src="/logo.png"
                alt="SurfBloom Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            {title && (
              <h1 className="text-3xl font-bold text-center mb-2 text-black/80">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-center text-muted-foreground">{subtitle}</p>
            )}
          </CardHeader>
          <CardContent className="pb-8 pt-0 -mt-2">
            {Array.isArray(children) ? formContent : children}
          </CardContent>
        </Card>
        {footerElement && (
          <div className="w-full max-w-[30.8rem] mt-6 space-y-2">
            {footerElement}
          </div>
        )}
      </div>
      <div className="h-screen bg-gradient-to-br from-sky-200 via-cyan-100 to-orange-200 hidden lg:flex items-center justify-center lg:sticky lg:top-0">
        <div>
          <Image
            src="/sloganLogo.png"
            alt="Slogan Logo"
            width={350}
            height={350}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
