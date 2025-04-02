import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  value: string;
  onChange?: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  value,
  onChange,
  onKeyDown,
  isLoading,
}: MessageInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="Send a message"
      className="resize-none border-none shadow-none focus-visible:ring-0"
      disabled={isLoading}
      rows={4}
    />
  );
}
