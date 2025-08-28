import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { type ForwardedRef, useMemo, useState } from "react";

/**
 * PasswordInput - a reusable password input with show/hide toggle.
 * Accepts all Input props and className for styling.
 */

type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  showStrengthMeter?: boolean;
  placeHolder?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className = "",
      showStrengthMeter = false,
      placeHolder = "*******",
      value,
      ...props
    },
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [show, setShow] = useState(false);

    // Password strength calculation
    const passwordStrength = useMemo((): PasswordStrength => {
      const password = (value as string) || "";
      if (!password) return { score: 0, label: "", color: "#e5e7eb" };

      let score = 0;
      const checks = {
        length: password.length >= 10,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        noCommon: !/password|123456|qwerty|admin|letmein/i.test(password),
      };

      // Calculate score based on criteria
      if (checks.length) score += 2;
      if (checks.lowercase) score += 1;
      if (checks.uppercase) score += 1;
      if (checks.number) score += 1;
      if (checks.special) score += 2;
      if (checks.noCommon) score += 1;
      if (password.length >= 12) score += 1;
      if (password.length >= 16) score += 1;

      // Determine strength level
      if (score <= 2) return { score, label: "Very Weak", color: "#ef4444" };
      if (score <= 4) return { score, label: "Weak", color: "#f97316" };
      if (score <= 6) return { score, label: "Fair", color: "#eab308" };
      if (score <= 8) return { score, label: "Strong", color: "#22c55e" };
      return { score, label: "Very Strong", color: "#16a34a" };
    }, [value]);

    return (
      <div>
        <div style={{ position: "relative" }}>
          <Input
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(className, "pr-10")}
            value={value}
            autoComplete="new-password"
            placeholder={placeHolder}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#888",
            }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {showStrengthMeter && value && (
          <div style={{ marginTop: "8px" }}>
            {/* Strength bar */}
            <div
              style={{
                width: "100%",
                height: "4px",
                backgroundColor: "#e5e7eb",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(passwordStrength.score / 10) * 100}%`,
                  height: "100%",
                  backgroundColor: passwordStrength.color,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {/* Strength label */}
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: passwordStrength.color,
                fontWeight: "500",
              }}
            >
              {passwordStrength.label}
            </div>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
