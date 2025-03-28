
import { toast } from "sonner";

// Powerdrill API 的基础URL
const API_BASE_URL = "https://ai.data.cloud/api/v2/team";

// API 凭证接口
export interface PowerdrillCredentials {
  userId: string;
  apiKey: string;
}

// Dataset 和 DataSource 类型
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

// 主 API 服务类
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
      try {
        this.credentials = JSON.parse(savedCredentials);
        return this.credentials;
      } catch (error) {
        console.error("无法解析存储的凭证:", error);
        localStorage.removeItem('powerdrill_credentials');
        return null;
      }
    }
    return null;
  }

  clearCredentials() {
    this.credentials = null;
    localStorage.removeItem('powerdrill_credentials');
  }

  private getHeaders() {
    if (!this.credentials) {
      throw new Error("API 凭证未设置");
    }

    return {
      "Content-Type": "application/json",
      "X-User-ID": this.credentials.userId,
      "X-API-Key": this.credentials.apiKey,
      // 添加CORS相关的头部
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-User-ID, X-API-Key"
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.credentials) {
      throw new Error("API 凭证未设置");
    }
    
    try {
      console.log(`发送请求到: ${API_BASE_URL}${endpoint}`);
      
      const headers = this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        // 添加额外的fetch选项
        mode: 'cors',
        credentials: 'omit'
      });

      console.log(`收到响应状态码: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `API 请求失败，状态码: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error("API错误数据:", errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.error("无法解析错误响应JSON:", e);
          // 如果不能解析为 JSON，使用默认错误消息
        }
        
        // 针对常见状态码提供更具体的错误信息
        if (response.status === 401 || response.status === 403) {
          errorMessage = "无效的凭证，请检查您的 User ID 和 API Key";
        } else if (response.status === 404) {
          errorMessage = "请求的资源不存在";
        } else if (response.status >= 500) {
          errorMessage = "服务器错误，请稍后再试";
        }
        
        throw new Error(errorMessage);
      }

      if (options.method === "DELETE") {
        return { success: true };
      }

      const responseData = await response.json();
      console.log("API返回数据:", responseData);
      return responseData;
    } catch (error) {
      console.error("API 请求失败:", error);
      
      // 区分网络错误和其他错误
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network') || 
            error.message.includes('Failed to fetch')) {
          throw new Error("无法连接到 PowerDrill API，请检查您的网络连接或API地址是否正确");
        }
        throw error;
      }
      
      throw new Error("API 请求失败");
    }
  }

  // Dataset 操作
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

  // Data source 操作
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
        throw new Error(errorData.message || `API 请求失败 with status ${response.status}`);
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

  // Job 操作
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
          throw new Error(errorData.message || `API 请求失败 with status ${response.status}`);
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

// 创建单例实例
export const powerdrill = new PowerdrillAPI();
