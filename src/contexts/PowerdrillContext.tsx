import React, { createContext, useContext, useEffect, useState } from 'react';
import { PowerdrillAPI, PowerdrillCredentials, Dataset, DataSource, StreamChunk } from '../services/api';
import { toast } from 'sonner';

interface PowerdrillContextType {
  credentials: PowerdrillCredentials | null;
  api: PowerdrillAPI;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentDataset: Dataset | null;
  datasets: Dataset[];
  dataSources: DataSource[];
  messages: Message[];
  canvasContent: CanvasContent | null;
  explorationQuestions: string[];
  setCredentials: (creds: PowerdrillCredentials) => Promise<void>;
  logout: () => void;
  loadDatasets: () => Promise<void>;
  createDataset: (name: string) => Promise<Dataset>;
  loadDataSources: (datasetId: string) => Promise<void>;
  createDataSource: (file: File) => Promise<DataSource>;
  deleteDataset: (datasetId: string) => Promise<void>;
  deleteDataSource: (dataSourceId: string) => Promise<void>;
  setCurrentDataset: (dataset: Dataset | null) => void;
  askQuestion: (question: string) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  resetMessages: () => void;
  clearCanvas: () => void;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'file-upload' | 'questions';
  files?: File[];
  questions?: string[];
  loading?: boolean;
  datasetId?: string;
}

export interface CanvasContent {
  message?: string;
  images?: string[];
  tables?: {
    columns: string[];
    data: any[][];
  }[];
}

const PowerdrillContext = createContext<PowerdrillContextType | undefined>(undefined);

export const PowerdrillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = new PowerdrillAPI();
  
  const [credentials, setCredentialsState] = useState<PowerdrillCredentials | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [canvasContent, setCanvasContent] = useState<CanvasContent | null>(null);
  const [explorationQuestions, setExplorationQuestions] = useState<string[]>([]);

  useEffect(() => {
    const savedCredentials = api.loadCredentials();
    if (savedCredentials) {
      setCredentialsState(savedCredentials);
      setIsAuthenticated(true);
    }
  }, []);

  const setCredentials = async (creds: PowerdrillCredentials): Promise<void> => {
    try {
      api.setCredentials(creds);
      
      setIsLoading(true);
      console.log("尝试验证API凭证...");
      
      try {
        await api.listDatasets();
        console.log("API凭证验证成功");
        
        setCredentialsState(creds);
        setIsAuthenticated(true);
        return Promise.resolve();
      } catch (error) {
        console.error("API调用失败:", error);
        
        api.clearCredentials();
        setCredentialsState(null);
        setIsAuthenticated(false);
        return Promise.reject(error);
      }
    } catch (error) {
      console.error("凭证验证失败:", error);
      api.clearCredentials();
      setCredentialsState(null);
      setIsAuthenticated(false);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearCredentials();
    setCredentialsState(null);
    setIsAuthenticated(false);
    setCurrentDataset(null);
    setDatasets([]);
    setDataSources([]);
    resetMessages();
    clearCanvas();
  };

  const resetMessages = () => {
    setMessages([]);
  };

  const clearCanvas = () => {
    setCanvasContent(null);
  };

  const loadDatasets = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const datasetList = await api.listDatasets();
      setDatasets(datasetList);
    } catch (error) {
      console.error("Failed to load datasets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDataset = async (name: string): Promise<Dataset> => {
    setIsLoading(true);
    try {
      const dataset = await api.createDataset(name);
      await loadDatasets();
      return dataset;
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataSources = async (datasetId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const sourcesList = await api.listDataSources(datasetId);
      setDataSources(sourcesList);
    } catch (error) {
      console.error("Failed to load data sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDataSource = async (file: File): Promise<DataSource> => {
    if (!currentDataset) {
      throw new Error("No dataset selected");
    }
    
    setIsLoading(true);
    try {
      const dataSource = await api.createDataSource(currentDataset.id, file);
      await loadDataSources(currentDataset.id);
      return dataSource;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDataset = async (datasetId: string) => {
    setIsLoading(true);
    try {
      await api.deleteDataset(datasetId);
      if (currentDataset?.id === datasetId) {
        setCurrentDataset(null);
      }
      await loadDatasets();
      toast.success("Dataset deleted successfully");
    } catch (error) {
      console.error("Failed to delete dataset:", error);
      toast.error("Failed to delete dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDataSource = async (dataSourceId: string) => {
    setIsLoading(true);
    try {
      await api.deleteDataSource(dataSourceId);
      if (currentDataset) {
        await loadDataSources(currentDataset.id);
      }
      toast.success("Data source deleted successfully");
    } catch (error) {
      console.error("Failed to delete data source:", error);
      toast.error("Failed to delete data source");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!currentDataset) {
      throw new Error("No dataset selected");
    }
    
    const uploadMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Uploaded ${files.length} file(s)`,
      timestamp: new Date(),
      type: 'file-upload',
      files: files,
      datasetId: currentDataset.id
    };
    
    setMessages(prev => [...prev, uploadMessage]);
    
    const processingMessage: Message = {
      id: Date.now().toString() + '-processing',
      role: 'system',
      content: 'Processing your data...',
      timestamp: new Date(),
      type: 'text',
      loading: true
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    setIsLoading(true);
    try {
      for (const file of files) {
        await createDataSource(file);
      }
      
      let status = { status: 'processing' };
      while (status.status !== 'ready' && status.status !== 'failed') {
        status = await api.getDatasetStatus(currentDataset.id);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (status.status === 'failed') {
        throw new Error("Dataset processing failed");
      }
      
      const overview = await api.getDatasetOverview(currentDataset.id);
      setExplorationQuestions(overview.exploration_questions);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === processingMessage.id 
            ? {
                ...msg,
                content: 'Your data has been processed successfully!',
                loading: false,
                type: 'questions',
                questions: overview.exploration_questions
              }
            : msg
        )
      );
      
    } catch (error) {
      console.error("Failed to upload and process files:", error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === processingMessage.id 
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : 'Failed to process data'}`,
                loading: false
              }
            : msg
        )
      );
      
      toast.error("Failed to process data");
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    if (!currentDataset) {
      throw new Error("No dataset selected");
    }
    
    const questionMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, questionMessage]);
    
    const responseId = Date.now().toString() + '-response';
    const responsePlaceholder: Message = {
      id: responseId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text',
      loading: true
    };
    
    setMessages(prev => [...prev, responsePlaceholder]);
    
    try {
      const response = await api.createJob(currentDataset.id, question, true);
      
      clearCanvas();
      
      let responseContent = '';
      let newCanvasContent: CanvasContent = {
        images: [],
        tables: []
      };
      let newQuestions: string[] = [];
      
      await api.processStreamResponse(response, (chunk: StreamChunk) => {
        if (chunk.event === 'MESSAGE') {
          responseContent += chunk.data.message;
          newCanvasContent.message = responseContent;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === responseId 
                ? { ...msg, content: responseContent, loading: false }
                : msg
            )
          );
        } 
        else if (chunk.event === 'IMAGE') {
          if (!newCanvasContent.images) {
            newCanvasContent.images = [];
          }
          newCanvasContent.images.push(chunk.data.url);
          setCanvasContent({ ...newCanvasContent });
        } 
        else if (chunk.event === 'TABLE') {
          if (!newCanvasContent.tables) {
            newCanvasContent.tables = [];
          }
          newCanvasContent.tables.push({
            columns: chunk.data.columns,
            data: chunk.data.data
          });
          setCanvasContent({ ...newCanvasContent });
        } 
        else if (chunk.event === 'QUESTIONS') {
          newQuestions = chunk.data.questions;
          setExplorationQuestions(newQuestions);
        }
        
        setCanvasContent({ ...newCanvasContent });
      });
      
      if (newQuestions.length > 0) {
        const questionsMessage: Message = {
          id: Date.now().toString() + '-questions',
          role: 'assistant',
          content: 'You might also want to ask:',
          timestamp: new Date(),
          type: 'questions',
          questions: newQuestions
        };
        
        setMessages(prev => [...prev, questionsMessage]);
      }
      
    } catch (error) {
      console.error("Failed to get answer:", error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId 
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : 'Failed to get answer'}`,
                loading: false
              }
            : msg
        )
      );
      
      toast.error("Failed to get answer");
    }
  };

  const contextValue: PowerdrillContextType = {
    credentials,
    api,
    isAuthenticated,
    isLoading,
    currentDataset,
    datasets,
    dataSources,
    messages,
    canvasContent,
    explorationQuestions,
    setCredentials,
    logout,
    loadDatasets,
    createDataset,
    loadDataSources,
    createDataSource,
    deleteDataset,
    deleteDataSource,
    setCurrentDataset,
    askQuestion,
    uploadFiles,
    resetMessages,
    clearCanvas,
  };

  return (
    <PowerdrillContext.Provider value={contextValue}>
      {children}
    </PowerdrillContext.Provider>
  );
};

export const usePowerdrill = () => {
  const context = useContext(PowerdrillContext);
  if (context === undefined) {
    throw new Error('usePowerdrill 必须在 PowerdrillProvider 内部使用');
  }
  return context;
};
