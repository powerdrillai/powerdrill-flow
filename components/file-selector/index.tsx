import { useMutation, useQuery } from "@tanstack/react-query";
import { FileIcon, PaperclipIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMultipartUpload } from "@/hooks/useMultipartUpload";
import { appToast } from "@/lib/toast";
import { createDataset } from "@/services/powerdrill/dataset.service";
import {
  createDataSource,
  listDataSources,
} from "@/services/powerdrill/datasource.service";
import { useSessionStore } from "@/store/session-store";
import { DataSourceRecord, SelectedDataset } from "@/types/data";

import FileSelectorDialog from "./file-selector-dialog";

interface FileSelectorProps {
  disabled?: boolean;
  sessionId: string;
}

// Define supported file types
const SUPPORTED_FILE_TYPES = [
  ".csv",
  ".tsv",
  ".md",
  ".mdx",
  ".json",
  ".txt",
  ".pdf",
  ".pptx",
  ".ppt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];
const MAX_FILES = 10;

export function FileSelector({ disabled, sessionId }: FileSelectorProps) {
  const { sessionMap, setDataset, clearSession } = useSessionStore();
  const session = sessionMap[sessionId];
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pollingDatasetId, setPollingDatasetId] = useState<string | null>(null);

  // Use multipart upload hook
  const { upload, isUploading: isMultipartUploading } = useMultipartUpload({
    onProgress: (progressData) => {
      console.log("Upload progress:", progressData);
    },
  });

  // Create dataset mutation
  const createDatasetMutation = useMutation({
    mutationFn: async (params: { name: string; description: string }) => {
      return await createDataset(params);
    },
  });

  // Create data source mutation
  const createDataSourceMutation = useMutation({
    mutationFn: async (params: {
      datasetId: string;
      name: string;
      file_object_key: string;
    }) => {
      return await createDataSource(params.datasetId, {
        name: params.name,
        file_object_key: params.file_object_key,
      });
    },
  });

  // Use TanStack Query to implement polling for data source status
  useQuery({
    queryKey: ["datasources", pollingDatasetId],
    queryFn: async () => {
      if (!pollingDatasetId) return null;
      return await listDataSources(pollingDatasetId);
    },
    enabled: !!pollingDatasetId,
    refetchInterval: (res) => {
      const records = res?.state.data?.records;

      if (records?.every((item) => item.status === "synched")) {
        setPollingDatasetId(null);

        const selectedDataset = session?.selectedDataset;
        if (selectedDataset) {
          const updatedDataset = {
            ...selectedDataset,
            datasource: selectedDataset.datasource.map((source) => ({
              ...source,
              status: records.find((item) => item.id === source.id)?.status,
            })),
          };
          setDataset(sessionId, updatedDataset);
        }

        return false;
      }
      return 2000;
    },
  });

  const handleUploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > MAX_FILES) {
      appToast.warning("File Count Limit Exceeded", {
        description: `Maximum ${MAX_FILES} files can be selected at once.`,
        icon: <FileIcon className="size-5" />,
      });
      return;
    }

    // Check for unsupported file types
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

      if (SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    // If there are any unsupported file types, abort the upload
    if (invalidFiles.length > 0) {
      appToast.error("Unsupported File Type", {
        description: `The following files are not supported: ${invalidFiles.join(", ")}`,
        icon: <FileIcon className="size-5" />,
      });
      return;
    }

    if (validFiles.length === 0) {
      appToast.warning("No Valid Files", {
        description: `Please select supported file types: ${SUPPORTED_FILE_TYPES.join(", ")}`,
        icon: <FileIcon className="size-5" />,
      });
      return;
    }

    try {
      setIsUploading(true);

      // Clear current session data
      clearSession(sessionId);

      // Create temporary dataset object
      const datasetId = uuidv4();
      const datasetName = `Dataset_${new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").split(".")[0]}`;

      const tempDataset: SelectedDataset = {
        id: datasetId,
        name: datasetName,
        description: "",
        datasource: validFiles.map((file) => ({
          id: uuidv4(),
          name: file.name,
          status: "creating",
          type: "FILE",
          size: file.size,
          dataset_id: datasetId,
        })),
      };

      // Set temporary dataset
      setDataset(sessionId, tempDataset);

      // Upload files
      const fileObjectKeys = await upload(validFiles);

      // Create mapping between file names and object keys
      const fileObjectKeyMap = validFiles.reduce(
        (map, file, index) => {
          map[file.name] = fileObjectKeys[index];
          return map;
        },
        {} as Record<string, string>
      );

      // Create dataset
      const createdDatasetId = await createDatasetMutation.mutateAsync({
        name: datasetName,
        description: "",
      });
      console.log("createdDatasetId", createdDatasetId);

      // Create data source and get ID
      const createdDataSources = await Promise.all(
        validFiles.map(async (file) => {
          const fileObjectKey = fileObjectKeyMap[file.name];
          const dataSource = await createDataSourceMutation.mutateAsync({
            datasetId: createdDatasetId,
            name: file.name,
            file_object_key: fileObjectKey,
          });
          return { fileName: file.name, dataSource };
        })
      );

      // Create mapping from filename to data source
      const dataSourceMap = createdDataSources.reduce(
        (map, item) => {
          map[item.fileName] = item.dataSource as DataSourceRecord;
          return map;
        },
        {} as Record<string, DataSourceRecord>
      );

      // Update dataset and data source IDs using filename as matching criteria
      const updatedDataset: SelectedDataset = {
        ...tempDataset,
        id: createdDatasetId,
        datasource: tempDataset.datasource.map((source) => {
          const matchedSource = dataSourceMap[source.name];
          return {
            ...source,
            id: matchedSource?.id || source.id,
            dataset_id: createdDatasetId,
            status: matchedSource?.status || "creating",
          };
        }),
      };
      // Update to session
      setDataset(sessionId, updatedDataset);

      // Start polling data source status
      setPollingDatasetId(createdDatasetId);

      // Files uploaded successfully

      appToast.success("Files Uploaded Successfully", {
        description: `Dataset and data sources created successfully. Syncing data...`,
        icon: <FileIcon className="size-5" />,
        duration: 5000,
      });
    } catch (error) {
      console.error("Failed to upload file:", error);

      // Check if it's a workspace capacity error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.toLowerCase().includes("insufficient storage") ||
        errorMessage.toLowerCase().includes("workspace capacity")
      ) {
        appToast.workspaceCapacity(errorMessage);
      } else {
        appToast.uploadError(
          validFiles.length > 1 ? "files" : validFiles[0]?.name || "file",
          errorMessage
        );
      }
    } finally {
      setIsUploading(false);
      // Clear file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectExistingFile = () => {
    setFileSelectorOpen(true);
  };

  const handleFileSelect = (selected: SelectedDataset) => {
    setDataset(sessionId, selected);
    setFileSelectorOpen(false);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={SUPPORTED_FILE_TYPES.join(",")}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            disabled={disabled || isUploading || isMultipartUploading}
          >
            <PaperclipIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleUploadFile}
            disabled={isUploading || isMultipartUploading}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            <span>Upload File</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSelectExistingFile}
            disabled={isUploading || isMultipartUploading}
          >
            <span>Select Existing File</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FileSelectorDialog
        open={fileSelectorOpen}
        onOpenChange={setFileSelectorOpen}
        onSelect={handleFileSelect}
        dataset={session?.selectedDataset}
      />
    </>
  );
}
