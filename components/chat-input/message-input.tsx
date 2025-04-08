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
      placeholder="Send a message..."
      className="resize-none border-none bg-transparent p-2 text-base placeholder:text-gray-400 focus-visible:ring-0"
      disabled={isLoading}
      rows={3}
    />
  );
}
