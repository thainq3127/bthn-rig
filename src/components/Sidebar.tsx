/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState } from 'react';
import { useSerialPorts } from '~/hooks/useSerialPorts';
import { useSerialPortConnection } from '~/hooks/useSerialPortConnection';
import { SerialPortSelect } from '~/components/SerialPortSelect';
import { SerialPortCard } from '~/components/SerialPortCard';
import { StepperControl } from '~/components/StepperControl';
import { TRPCStatus } from '~/components/TRPCStatus';

type ViewMode = 'select' | 'cards';

export function Sidebar() {
  const { ports, isLoading, error, refetch } = useSerialPorts();
  const { testConnection, isTestingConnection, testConnectionError } = useSerialPortConnection();
  const [selectedPort, setSelectedPort] = useState<string>();
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [connectionResult, setConnectionResult] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!selectedPort) return;
    
    try {
      setConnectionResult(null);
      const result = await testConnection(selectedPort);
      setConnectionResult(result.success ? (result.message ?? 'Connected successfully') : (result.error ?? 'Unknown error'));
    } catch (err) {
      setConnectionResult(err instanceof Error ? err.message : 'Connection test failed');
    }
  };

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Serial Ports</h2>
        <p className="text-sm text-gray-500 mt-1">Select a connected port</p>
        
        {/* View Mode Toggle */}
        <div className="mt-3 flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('select')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'select'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dropdown
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => void refetch()}
              className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Port Selection */}
        {!isLoading && (
          <>
            {viewMode === 'select' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Available Ports
                </label>
                <SerialPortSelect
                  ports={ports}
                  selectedPort={selectedPort}
                  onPortSelect={setSelectedPort}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Available Ports ({ports.length})
                </label>
                {ports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No serial ports found</p>
                    <button
                      onClick={() => void refetch()}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ports.map((port: any) => (
                      <SerialPortCard
                        key={port.path}
                        port={port}
                        isSelected={selectedPort === port.path}
                        onSelect={setSelectedPort}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Selected Port Info (only for select mode) */}
        {viewMode === 'select' && selectedPort && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Selected Port Info
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900">{selectedPort}</p>
              {(() => {
                const port = ports.find((p: { path: string }) => p.path === selectedPort);
                return port && (
                  <div className="mt-2 space-y-1 text-xs text-blue-700">
                    {port.manufacturer && (
                      <p><span className="font-medium">Manufacturer:</span> {port.manufacturer}</p>
                    )}
                    {port.serialNumber && (
                      <p><span className="font-medium">Serial:</span> {port.serialNumber}</p>
                    )}
                    {port.vendorId && (
                      <p><span className="font-medium">Vendor ID:</span> {port.vendorId}</p>
                    )}
                    {port.productId && (
                      <p><span className="font-medium">Product ID:</span> {port.productId}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Test Connection */}
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>

            {/* Connection Result */}
            {connectionResult && (
              <div className={`mt-2 p-2 rounded-md text-xs ${
                connectionResult.includes('Success') || connectionResult.includes('Connected')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {connectionResult}
              </div>
            )}

            {/* tRPC Error */}
            {testConnectionError && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs">
                Error: {testConnectionError}
              </div>
            )}
          </div>
        )}

        {/* Stepper Motor Control */}
        <StepperControl 
          isConnected={!!selectedPort && (connectionResult?.includes('Success') ?? false)}
          selectedPort={selectedPort}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Refresh Button */}
        <button
          onClick={() => void refetch()}
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Ports'}
        </button>

        {/* Status */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>{ports.length} port{ports.length !== 1 ? 's' : ''} found</p>
          {selectedPort && (
            <p className="text-blue-600">Connected to {selectedPort}</p>
          )}
          <TRPCStatus />
        </div>
      </div>
    </div>
  );
}
