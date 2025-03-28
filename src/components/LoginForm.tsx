
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePowerdrill } from "@/contexts/PowerdrillContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

const LoginForm = () => {
  const { setCredentials } = usePowerdrill();
  const [userId, setUserId] = useState('tmm-cm5vy5e6e0ar907s9o39nk9kv'); // 预填充User ID
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('未连接');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userId.trim() || !apiKey.trim()) {
      setError('请输入 User ID 和 API Key');
      toast.error('请输入 User ID 和 API Key');
      return;
    }

    setApiStatus('正在连接...');
    setLoading(true);
    try {
      console.log('尝试使用以下凭证连接PowerDrill API:', { userId, apiKey: '***' });
      // 设置凭证并尝试测试连接
      await setCredentials({ userId, apiKey });
      setApiStatus('已连接');
      toast.success('登录成功');
    } catch (error) {
      console.error('登录错误:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '登录失败，请检查您的凭证或网络连接';
      
      // 提供更明确的错误信息
      let displayError = errorMessage;
      setApiStatus('连接失败');
      
      if (errorMessage.includes('fetch') || errorMessage.includes('网络')) {
        displayError = '无法连接到 PowerDrill API，请检查您的网络连接或API地址是否正确';
      } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('无效的凭证')) {
        displayError = '无效的凭证，请检查您的 User ID 和 API Key';
      }
      
      setError(displayError);
      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PowerDrill AI Analyzer</CardTitle>
          <CardDescription>输入您的 PowerDrill 凭证以继续</CardDescription>
          <div className="mt-2 bg-blue-50 p-2 rounded-md flex items-center text-sm text-blue-600">
            <Info className="h-4 w-4 mr-2" />
            <span>API地址: <code className="bg-blue-100 px-1 rounded">{API_BASE_URL}</code></span>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium">
                User ID
              </label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="输入您的 User ID"
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
                placeholder="输入您的 API Key"
                required
              />
            </div>
            <div className="text-sm text-gray-500 mt-2">
              <span>API连接状态: </span>
              <span className={`font-medium ${
                apiStatus === '已连接' ? 'text-green-600' : 
                apiStatus === '正在连接...' ? 'text-yellow-600' :
                apiStatus === '连接失败' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {apiStatus}
              </span>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? '登录中...' : '继续'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>
            需要 PowerDrill 凭证？访问{' '}
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
    </div>
  );
};

export default LoginForm;
