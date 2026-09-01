import type { TextareaHTMLAttributes } from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

function Textarea(props: TextareaProps) {
  return <textarea {...props} />;
}

export default Textarea;