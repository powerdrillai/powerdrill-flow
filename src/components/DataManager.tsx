
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import { Settings, Folder, FileIcon, Trash } from "lucide-react";

const DataManager = () => {
  const { 
    datasets, 
    dataSources, 
    currentDataset, 
    loadDatasets, 
    loadDataSources, 
    setCurrentDataset, 
    deleteDataset, 
    deleteDataSource 
  } = usePowerdrill();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<{type: 'dataset' | 'datasource', id: string} | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (currentDataset) {
      loadDataSources(currentDataset.id);
    }
  }, [currentDataset]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await loadDatasets();
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDataset = async (datasetId: string) => {
    const selected = datasets.find(d => d.id === datasetId);
    if (selected) {
      setCurrentDataset(selected);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    try {
      await deleteDataset(datasetId);
      setShowConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete dataset:", error);
    }
  };

  const handleDeleteDataSource = async (dataSourceId: string) => {
    try {
      await deleteDataSource(dataSourceId);
      setShowConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete data source:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <Settings size={20} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Data Manager</DialogTitle>
            <DialogDescription>
              Manage your datasets and data sources
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto p-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder size={18} />
                  Datasets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : datasets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No datasets available</div>
                ) : (
                  <ul className="space-y-2">
                    {datasets.map((dataset) => (
                      <li 
                        key={dataset.id}
                        className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                          currentDataset?.id === dataset.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectDataset(dataset.id)}
                      >
                        <div>
                          <div className="font-medium">{dataset.name}</div>
                          <div className="text-xs text-gray-500">ID: {dataset.id}</div>
                          <div className="text-xs text-gray-500">Status: {dataset.status}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirmDelete({ type: 'dataset', id: dataset.id });
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileIcon size={18} />
                  Data Sources {currentDataset && `for ${currentDataset.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!currentDataset ? (
                  <div className="text-center py-8 text-gray-500">Select a dataset to view its data sources</div>
                ) : isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : dataSources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No data sources available</div>
                ) : (
                  <ul className="space-y-2">
                    {dataSources.map((source) => (
                      <li 
                        key={source.id}
                        className="p-3 rounded-md flex justify-between items-center hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-xs text-gray-500">Status: {source.status}</div>
                          {source.file_type && (
                            <div className="text-xs text-gray-500">Type: {source.file_type}</div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setShowConfirmDelete({ type: 'datasource', id: source.id })}
                        >
                          <Trash size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      {showConfirmDelete && (
        <Dialog open={!!showConfirmDelete} onOpenChange={() => setShowConfirmDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {showConfirmDelete.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (showConfirmDelete.type === 'dataset') {
                    handleDeleteDataset(showConfirmDelete.id);
                  } else {
                    handleDeleteDataSource(showConfirmDelete.id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DataManager;
