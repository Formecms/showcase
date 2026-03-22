import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RichTextProps {
  content: string;
  className?: string;
  dark?: boolean;
}

export function RichText({ content, className = "", dark = false }: RichTextProps) {
  const proseTheme = dark ? "prose-forme-dark" : "prose-forme";
  return (
    <div className={`prose prose-lg ${proseTheme} max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
