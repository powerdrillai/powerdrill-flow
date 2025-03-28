
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import ChatInterface from "./ChatInterface";
import FileUpload from "./FileUpload";
import Canvas from "./Canvas";
import DataManager from "./DataManager";
import { LogOut } from "lucide-react";

const MainLayout = () => {
  const { logout, currentDataset } = usePowerdrill();
  const [showFileUpload, setShowFileUpload] = useState(!currentDataset);

  const handleFileUploadComplete = () => {
    setShowFileUpload(false);
  };

  const handleOpenFileUpload = () => {
    setShowFileUpload(true);
  };

  return (
    <div className="flex h-screen relative">
      {/* Canvas section (left side) */}
      <Canvas />
      
      {/* Chat interface section (right side) */}
      <div className="flex-1 ml-auto relative h-full">
        <div className="absolute top-4 right-20">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={logout}
            title="Logout"
          >
            <LogOut size={20} />
          </Button>
        </div>
        
        <DataManager />
        
        {showFileUpload ? (
          <div className="h-full flex items-center justify-center p-4">
            <FileUpload onComplete={handleFileUploadComplete} />
          </div>
        ) : (
          <ChatInterface onFileUpload={handleOpenFileUpload} />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
