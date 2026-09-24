import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const fieldClasses =
  "w-full px-3 py-2.5 border border-ink/20 bg-chalk focus:border-ink outline-none";
const labelClasses =
  "block text-xs font-mono tracking-widest2 uppercase text-ink-60 mb-1.5";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = "", ...props }, ref) => (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <input ref={ref} id={id} className={`${fieldClasses} ${className}`} {...props} />
    </div>
  )
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className = "", ...props }, ref) => (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className={`${fieldClasses} resize-none ${className}`}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";
