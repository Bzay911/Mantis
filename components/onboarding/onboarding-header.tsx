// components/onboarding/onboarding-header.tsx
import { View } from "react-native";

type Variant = "dark" | "light";

const COLORS: Record<Variant, { active: string; inactive: string }> = {
  dark: { active: "#9DC228", inactive: "#2C2C2E" },
  light: { active: "#0A0A0A", inactive: "#93AA45" },
};

export function OnboardingHeader({
  step,
  totalSteps = 4,
  variant = "dark",
  className = "",
}: {
  step: number;
  totalSteps?: number;
  variant?: Variant;
  className?: string;
}) {
  const { active, inactive } = COLORS[variant];

  return (
    <View
      className={`flex-row items-center justify-center gap-2 pt-2 pb-3 ${className}`}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCurrent = i === step - 1;
        const isDone = i < step;

        return (
          <View
            key={i}
            className="h-2 rounded-full"
            style={{
              width: isCurrent ? 36 : 20,
              backgroundColor: isDone ? active : inactive,
            }}
          />
        );
      })}
    </View>
  );
}