
import { useEffect } from 'react';
import { PowerdrillProvider, usePowerdrill } from "@/contexts/PowerdrillContext";
import LoginForm from "@/components/LoginForm";
import MainLayout from "@/components/MainLayout";

const IndexContent = () => {
  const { isAuthenticated, loadDatasets } = usePowerdrill();

  useEffect(() => {
    if (isAuthenticated) {
      loadDatasets();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <MainLayout /> : <LoginForm />;
};

const Index = () => {
  return (
    <PowerdrillProvider>
      <div className="min-h-screen bg-gray-50">
        <IndexContent />
      </div>
    </PowerdrillProvider>
  );
};

export default Index;
