
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import { X, Upload, File } from "lucide-react";

const ACCEPTED_FILES = [
  '.csv', '.tsv', '.md', '.mdx', '.json', '.txt', '.pdf', '.pptx', '.docx', '.xls', '.xlsx'
];

interface FileUploadProps {
  onComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onComplete }) => {
  const { currentDataset, createDataset, uploadFiles } = usePowerdrill();
  const [files, setFiles] = useState<File[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    
    if (!currentDataset && !datasetName) {
      toast.error('Please enter a dataset name');
      return;
    }
    
    setLoading(true);
    try {
      // If no current dataset, create a new one
      if (!currentDataset) {
        await createDataset(datasetName);
      }
      
      // Upload the files
      await uploadFiles(files);
      
      toast.success('Files uploaded successfully');
      onComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Upload Your Data</CardTitle>
        <CardDescription>
          Upload files to analyze. Supported formats: CSV, TSV, MD, MDX, JSON, TXT, PDF, PPTX, DOCX, XLS, XLSX
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!currentDataset && (
            <div className="space-y-2">
              <label htmlFor="datasetName" className="text-sm font-medium">
                Dataset Name
              </label>
              <input
                id="datasetName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter a name for your dataset"
                required={!currentDataset}
              />
            </div>
          )}
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept={ACCEPTED_FILES.join(',')}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: {ACCEPTED_FILES.join(', ')}
            </p>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload and Process'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
