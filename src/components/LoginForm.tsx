
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePowerdrill } from "@/contexts/PowerdrillContext";

const LoginForm = () => {
  const { setCredentials } = usePowerdrill();
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim() || !apiKey.trim()) {
      toast.error('Please enter both User ID and API Key');
      return;
    }
    
    setLoading(true);
    try {
      // Set the credentials
      setCredentials({ userId, apiKey });
      toast.success('Successfully logged in');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">PowerDrill AI Analyzer</CardTitle>
        <CardDescription>Enter your PowerDrill credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        <p>
          Need PowerDrill credentials? Visit{' '}
          <a
            href="https://powerdrill.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            powerdrill.ai
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
