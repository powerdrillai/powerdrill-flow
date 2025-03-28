
import { useEffect } from 'react';
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import LoginForm from "@/components/LoginForm";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "sonner";

const Index = () => {
  const { isAuthenticated, loadDatasets } = usePowerdrill();

  useEffect(() => {
    if (isAuthenticated) {
      loadDatasets();
    }
  }, [isAuthenticated, loadDatasets]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" closeButton richColors />
      {isAuthenticated ? <MainLayout /> : <LoginForm />}
    </div>
  );
};

export default Index;
