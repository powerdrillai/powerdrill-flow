
import { useEffect } from 'react';
import { PowerdrillProvider, usePowerdrill } from "@/contexts/PowerdrillContext";
import LoginForm from "@/components/LoginForm";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "sonner";

const IndexContent = () => {
  const { isAuthenticated, loadDatasets } = usePowerdrill();

  useEffect(() => {
    if (isAuthenticated) {
      loadDatasets();
    }
  }, [isAuthenticated, loadDatasets]);

  return isAuthenticated ? <MainLayout /> : <LoginForm />;
};

const Index = () => {
  return (
    <PowerdrillProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" closeButton richColors />
        <IndexContent />
      </div>
    </PowerdrillProvider>
  );
};

export default Index;
