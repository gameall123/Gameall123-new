import { cn } from "@/lib/utils";
import { Gamepad2 } from "lucide-react";

interface GameAllLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export function GameAllLogo({ 
  size = "md", 
  className,
  showText = true,
  animated = true
}: GameAllLogoProps) {
  const sizeConfig = {
    sm: { logo: "w-8 h-8", text: "text-lg", icon: "w-5 h-5" },
    md: { logo: "w-12 h-12", text: "text-xl", icon: "w-7 h-7" },
    lg: { logo: "w-16 h-16", text: "text-2xl", icon: "w-10 h-10" },
    xl: { logo: "w-24 h-24", text: "text-4xl", icon: "w-14 h-14" }
  };

  const config = sizeConfig[size];

  const LogoIcon = () => (
    <div className={cn(
      "relative rounded-2xl overflow-hidden shadow-lg",
      config.logo,
      "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700",
      "border-2 border-white/20",
      "flex items-center justify-center"
    )}>
      <Gamepad2 className={cn(config.icon, "text-white")} />
    </div>
  );

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <LogoIcon />
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent",
            config.text
          )}>
            GameAll
          </span>
          {size === "lg" || size === "xl" ? (
            <span className="text-xs text-gray-400 -mt-1">Gaming Store</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Large hero version for landing page
export function HeroGameAllLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border-4 border-white/20">
        <Gamepad2 className="w-20 h-20 text-white" />
      </div>
      <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent text-center">
        GameAll
      </h1>
      <p className="text-2xl text-gray-400 mt-2 text-center">Il tuo store gaming preferito</p>
    </div>
  );
}