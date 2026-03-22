import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "dark";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-reef-500 text-white hover:bg-reef-400 shadow-md hover:shadow-lg",
  secondary:
    "border border-sand-300 text-ocean-900 hover:border-reef-500 hover:text-reef-600 bg-white",
  dark: "border border-ocean-700 text-sand-200 hover:border-reef-500 hover:text-white bg-ocean-900",
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const isExternal = href.startsWith("http");
  const classes = `inline-flex items-center justify-center px-6 py-3 rounded-md font-medium text-[15px] transition-all duration-200 ease-out-expo card-hover ${variantClasses[variant]} ${className}`;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
