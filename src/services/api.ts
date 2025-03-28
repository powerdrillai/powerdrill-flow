
import { toast } from "sonner";

// Base URL for the Powerdrill API
const API_BASE_URL = "https://api.powerdrill.ai/v2";

// Interface for API credentials
export interface PowerdrillCredentials {
  userId: string;
  apiKey: string;
}

// Types for Dataset and DataSource
export interface Dataset {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: string;
  dataset_id: string;
  name: string;
  status: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

export interface DatasetOverview {
  exploration_questions: string[];
  dataset_info: {
    name: string;
    description: string;
    row_count: number;
    column_count: number;
    file_count: number;
    column_names: string[];
  };
}

export interface StreamChunk {
  event: string;
  data: any;
}

// Main API service class
export class PowerdrillAPI {
  private credentials: PowerdrillCredentials | null = null;

  constructor(credentials?: PowerdrillCredentials) {
    if (credentials) {
      this.credentials = credentials;
    }
  }

  setCredentials(credentials: PowerdrillCredentials) {
    this.credentials = credentials;
    localStorage.setItem('powerdrill_credentials', JSON.stringify(credentials));
  }

  loadCredentials(): PowerdrillCredentials | null {
    const savedCredentials = localStorage.getItem('powerdrill_credentials');
    if (savedCredentials) {
      this.credentials = JSON.parse(savedCredentials);
      return this.credentials;
    }
    return null;
  }

  clearCredentials() {
    this.credentials = null;
    localStorage.removeItem('powerdrill_credentials');
  }

  private getHeaders() {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }

    return {
      "Content-Type": "application/json",
      "X-User-ID": this.credentials.userId,
      "X-API-Key": this.credentials.apiKey,
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const headers = this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      if (options.method === "DELETE") {
        return { success: true };
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      toast.error(error instanceof Error ? error.message : "API request failed");
      throw error;
    }
  }

  // Dataset operations
  async createDataset(name: string) {
    return this.request("/datasets", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async listDatasets(): Promise<Dataset[]> {
    const response = await this.request("/datasets");
    return response.datasets || [];
  }

  async getDatasetStatus(datasetId: string) {
    return this.request(`/datasets/${datasetId}/status`);
  }

  async getDatasetOverview(datasetId: string): Promise<DatasetOverview> {
    return this.request(`/datasets/${datasetId}/overview`);
  }

  async deleteDataset(datasetId: string) {
    return this.request(`/datasets/${datasetId}`, {
      method: "DELETE",
    });
  }

  // Data source operations
  async createDataSource(datasetId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dataset_id", datasetId);

    try {
      const headers = this.getHeaders();
      // Remove Content-Type header as it will be set automatically for FormData
      delete headers["Content-Type"];

      const response = await fetch(`${API_BASE_URL}/data_sources`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
      throw error;
    }
  }

  async listDataSources(datasetId: string): Promise<DataSource[]> {
    const response = await this.request(`/datasets/${datasetId}/data_sources`);
    return response.data_sources || [];
  }

  async getDataSourceStatus(dataSourceId: string) {
    return this.request(`/data_sources/${dataSourceId}/status`);
  }

  async deleteDataSource(dataSourceId: string) {
    return this.request(`/data_sources/${dataSourceId}`, {
      method: "DELETE",
    });
  }

  // Job operations
  async createJob(datasetId: string, question: string, stream = true) {
    // For streaming, we need to handle the response differently
    if (stream) {
      try {
        const headers = this.getHeaders();
        const response = await fetch(`${API_BASE_URL}/jobs`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            dataset_id: datasetId,
            question,
            stream,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error("Failed to create job:", error);
        toast.error(error instanceof Error ? error.message : "Failed to create job");
        throw error;
      }
    } else {
      // For non-streaming, use the standard request method
      return this.request("/jobs", {
        method: "POST",
        body: JSON.stringify({
          dataset_id: datasetId,
          question,
          stream,
        }),
      });
    }
  }

  // Process streaming response
  async processStreamResponse(response: Response, onChunk: (chunk: StreamChunk) => void) {
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      const buffer: string[] = [];

      const processResult = async (result: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (result.done) {
          if (buffer.length > 0) {
            // Process any remaining data in the buffer
            const remaining = buffer.join("");
            if (remaining.trim()) {
              try {
                const chunk = JSON.parse(remaining);
                onChunk(chunk);
              } catch (e) {
                console.error("Failed to parse remaining JSON:", remaining);
              }
            }
          }
          return;
        }

        const text = decoder.decode(result.value, { stream: true });
        
        // Split by lines and process each line
        const lines = text.split("\n");
        
        // Add the first line to the buffer
        buffer.push(lines[0]);
        
        // Process complete lines
        if (lines.length > 1) {
          const completeLines = [buffer.join(""), ...lines.slice(1, -1)];
          buffer.length = 0;
          buffer.push(lines[lines.length - 1]);
          
          for (const line of completeLines) {
            if (line.trim()) {
              try {
                const chunk = JSON.parse(line);
                onChunk(chunk);
              } catch (e) {
                console.error("Failed to parse JSON:", line);
              }
            }
          }
        }
        
        // Continue reading
        return reader.read().then(processResult);
      };
      
      return reader.read().then(processResult);
    } catch (error) {
      console.error("Stream processing error:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const powerdrill = new PowerdrillAPI();
