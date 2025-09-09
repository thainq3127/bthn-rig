"use client";

import { useState } from 'react';
import type { SerialPort } from '~/hooks/useSerialPorts';

interface SerialPortCardProps {
  port: SerialPort;
  isSelected: boolean;
  onSelect: (port: string) => void;
}

export function SerialPortCard({ port, isSelected, onSelect }: SerialPortCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect(port.path)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div>
            <h3 className="font-medium text-gray-900">{port.path}</h3>
            {port.manufacturer && (
              <p className="text-sm text-gray-500">{port.manufacturer}</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {port.serialNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Serial Number:</span>
              <span className="font-mono text-gray-900">{port.serialNumber}</span>
            </div>
          )}
          {port.vendorId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vendor ID:</span>
              <span className="font-mono text-gray-900">{port.vendorId}</span>
            </div>
          )}
          {port.productId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Product ID:</span>
              <span className="font-mono text-gray-900">{port.productId}</span>
            </div>
          )}
          {port.pnpId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">PnP ID:</span>
              <span className="font-mono text-gray-900 break-all">{port.pnpId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
