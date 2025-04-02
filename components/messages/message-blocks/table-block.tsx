"use client";

import { IconEye, IconFileText } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableBlock } from "@/services/powerdrill/session.service";

interface TableBlockProps {
  block: TableBlock;
  isCanvas?: boolean;
}

export function TableBlockView({ block }: TableBlockProps) {
  const url = block.content.url;

  const { data: csvData, isLoading } = useQuery({
    queryKey: ["csv", url],
    queryFn: async () => {
      const response = await fetch(url);
      const text = await response.text();
      const result = Papa.parse(text, { header: true });
      console.log(result, "result");
      return {
        headers: result.meta.fields || [],
        rows: result.data
          .map((row: unknown) => Object.values(row as Record<string, string>))
          .filter((row) => row.length > 0 && !row.every((cell) => cell === "")),
      };
    },
    enabled: !!url,
  });

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  const displayRows = csvData?.rows.slice(0, 20) || [];
  const totalRows = csvData?.rows.length || 0;
  const hasMoreRows = totalRows > 20;

  return (
    <div className="space-y-2">
      {csvData && (
        <>
          {hasMoreRows && (
            <div className="text-muted-foreground mb-2 text-sm">
              Showing first 20 rows (total {totalRows} rows)
            </div>
          )}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {csvData.headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export function TableBlockComponent({
  block,
  isCanvas = false,
}: TableBlockProps) {
  if (isCanvas) {
    return <TableBlockView block={block} />;
  }

  return (
    <div className="bg-muted flex items-center justify-between rounded-md px-4 py-2">
      <div className="flex items-center gap-2">
        <IconFileText size={16} />
        <span className="text-sm">{block.content.name}</span>
      </div>
      <Button variant="ghost" size="icon" className="size-6">
        <IconEye size={16} />
      </Button>
    </div>
  );
}
