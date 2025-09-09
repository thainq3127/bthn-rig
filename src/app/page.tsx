"use client";

import { useState } from 'react';
import { Sidebar } from '~/components/Sidebar';
import { api } from '~/trpc/react';

export default function Home() {
  const [selectedPort, setSelectedPort] = useState<string>('');
  
  // Test direct tRPC calls
  const { data: portsData, isLoading } = api.serialPort.getSerialPorts.useQuery();
  const testConnectionMutation = api.serialPort.testConnection.useMutation();

  const handleTestAPI = async () => {
    if (!selectedPort) return;
    
    try {
      const result = await testConnectionMutation.mutateAsync({
        portPath: selectedPort,
        baudRate: 115200
      });
      console.log('Test result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Serial Port Manager
          </h1>
          <p className="text-gray-600 mb-8">
            Select a serial port from the sidebar and test tRPC integration.
          </p>

          {/* tRPC API Test Section */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">tRPC API Test</h2>
            
            {/* API Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium text-gray-700 mb-2">API Status</h3>
                <div className="text-sm">
                  <p>Loading: {isLoading ? '✅' : '❌'}</p>
                  <p>Success: {portsData?.success ? '✅' : '❌'}</p>
                  <p>Ports Found: {portsData?.count ?? 0}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium text-gray-700 mb-2">Test Connection</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter port (e.g. COM1)"
                    value={selectedPort}
                    onChange={(e) => setSelectedPort(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleTestAPI}
                    disabled={!selectedPort || testConnectionMutation.isPending}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>

            {/* API Response */}
            {portsData && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium text-gray-700 mb-2">Latest API Response</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(portsData, null, 2)}
                </pre>
              </div>
            )}

            {/* Connection Test Result */}
            {testConnectionMutation.data && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium text-gray-700 mb-2">Connection Test Result</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testConnectionMutation.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Display */}
            {testConnectionMutation.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <h3 className="font-medium text-red-700 mb-2">Error</h3>
                <p className="text-sm text-red-600">{testConnectionMutation.error.message}</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h2>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Select a port from the sidebar using either dropdown or card view</li>
              <li>• Click &quot;Test Connection&quot; to verify the port can be accessed</li>
              <li>• Monitor tRPC status in the sidebar footer</li>
              <li>• Use the API test section to manually test endpoints</li>
              <li>• Data refreshes automatically every 5 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
