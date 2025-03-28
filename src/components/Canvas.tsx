
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Canvas = () => {
  const { canvasContent } = usePowerdrill();
  const [expanded, setExpanded] = useState(false);

  // Auto-expand the canvas when content is available
  useEffect(() => {
    if (canvasContent && !expanded) {
      setExpanded(true);
    }
  }, [canvasContent]);

  if (!canvasContent) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-10 ${
        expanded ? 'w-1/2' : 'w-12'
      }`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-white shadow rounded-full p-2"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {expanded && (
        <div className="h-full overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
          
          {canvasContent.message && (
            <Card className="mb-6 p-4">
              <div className="prose max-w-none">
                <p>{canvasContent.message}</p>
              </div>
            </Card>
          )}
          
          {canvasContent.images && canvasContent.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Visualizations</h3>
              <div className="grid gap-4">
                {canvasContent.images.map((imageUrl, index) => (
                  <Card key={index} className="overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Visualization ${index + 1}`}
                      className="w-full object-contain"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {canvasContent.tables && canvasContent.tables.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Data Tables</h3>
              <div className="space-y-6">
                {canvasContent.tables.map((table, tableIndex) => (
                  <Card key={tableIndex} className="overflow-x-auto p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {table.columns.map((column, colIndex) => (
                            <th
                              key={colIndex}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {table.data.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {cell !== null && cell !== undefined ? cell.toString() : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
