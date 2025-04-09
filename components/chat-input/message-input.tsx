import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  value: string;
  onChange?: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  datasetId?: string; // Dataset ID
  datasetName?: string; // Dataset name
}

export function MessageInput({
  value,
  onChange,
  onKeyDown,
  isLoading,
  datasetId,
  datasetName,
}: MessageInputProps) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Send a message..."
        className="resize-none border-none !bg-transparent p-2 text-base shadow-none placeholder:text-gray-400 focus-visible:ring-0"
        disabled={isLoading}
        rows={2}
      />
    </div>
  );
}
