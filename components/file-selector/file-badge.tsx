import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FILE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  csv: { label: "CSV", color: "bg-green-500 text-white" },
  tsv: { label: "TSV", color: "bg-green-500 text-white" },
  md: { label: "MD", color: "bg-blue-500 text-white" },
  mdx: { label: "MDX", color: "bg-blue-500 text-white" },
  json: { label: "JSON", color: "bg-yellow-500 text-white" },
  txt: { label: "TXT", color: "bg-gray-500 text-white" },
  pdf: { label: "PDF", color: "bg-red-500 text-white" },
  pptx: { label: "PPTX", color: "bg-orange-500 text-white" },
  ppt: { label: "PPT", color: "bg-orange-500 text-white" },
  doc: { label: "DOC", color: "bg-blue-600 text-white" },
  docx: { label: "DOCX", color: "bg-blue-600 text-white" },
  xls: { label: "XLS", color: "bg-green-600 text-white" },
  xlsx: { label: "XLSX", color: "bg-green-600 text-white" },
};

export function FileBadge({ name }: { name: string }) {
  const getFileTypeBadge = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const fileType = FILE_TYPE_CONFIG[extension] || {
      label: "FILE",
      color: "bg-gray-400 text-white",
    };
    return fileType;
  };

  const fileType = getFileTypeBadge(name);

  return (
    <Badge className={cn("px-1.5 py-0 text-[10px]", fileType.color)}>
      {fileType.label}
    </Badge>
  );
}
