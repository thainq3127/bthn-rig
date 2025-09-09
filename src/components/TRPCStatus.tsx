"use client";

import { api } from '~/trpc/react';

export function TRPCStatus() {
  // Test tRPC connection bằng cách gọi health check endpoint
  const { data, isLoading, error } = api.serialPort.getSerialPorts.useQuery(undefined, {
    refetchInterval: 10000, // Check every 10 seconds
    retry: 3,
  });

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-400';
    if (error) return 'bg-red-400';
    if (data?.success) return 'bg-green-400';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (error) return `Error: ${error.message}`;
    if (data?.success) return `Connected • ${data.count} ports`;
    return 'Unknown status';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs text-gray-600">
        tRPC: {getStatusText()}
      </span>
    </div>
  );
}
