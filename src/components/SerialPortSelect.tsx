"use client";

import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@radix-ui/react-icons';
import type { SerialPort } from '~/hooks/useSerialPorts';

interface SerialPortSelectProps {
  ports: SerialPort[];
  selectedPort?: string;
  onPortSelect: (port: string) => void;
  isLoading?: boolean;
}

export function SerialPortSelect({ 
  ports, 
  selectedPort, 
  onPortSelect, 
  isLoading = false 
}: SerialPortSelectProps) {
  return (
    <Select.Root value={selectedPort} onValueChange={onPortSelect}>
      <Select.Trigger className="inline-flex items-center justify-between rounded px-4 py-2 text-sm leading-none bg-white text-gray-900 shadow-sm border border-gray-300 hover:bg-gray-50 focus:shadow-md focus:outline-none data-[placeholder]:text-gray-400 min-w-[200px]">
        <Select.Value placeholder={isLoading ? "Loading ports..." : "Select a serial port"} />
        <Select.Icon className="text-gray-400">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-400 cursor-default">
            <ChevronUpIcon />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {isLoading ? (
              <Select.Item value="loading" className="text-sm leading-none text-gray-400 rounded-sm flex items-center h-8 px-6 relative select-none cursor-default">
                <Select.ItemText>Loading...</Select.ItemText>
              </Select.Item>
            ) : ports.length === 0 ? (
              <Select.Item value="no-ports" className="text-sm leading-none text-gray-400 rounded-sm flex items-center h-8 px-6 relative select-none cursor-default">
                <Select.ItemText>No serial ports found</Select.ItemText>
              </Select.Item>
            ) : (
              ports.map((port) => (
                <SelectItem key={port.path} value={port.path} port={port} />
              ))
            )}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-400 cursor-default">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

interface SelectItemProps {
  value: string;
  port: SerialPort;
}

function SelectItem({ value, port }: SelectItemProps) {
  return (
    <Select.Item 
      value={value} 
      className="text-sm leading-none text-gray-900 rounded-sm flex items-center h-8 px-6 relative select-none data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 cursor-pointer"
    >
      <Select.ItemText>
        <div className="flex flex-col">
          <span className="font-medium">{port.path}</span>
          {port.manufacturer && (
            <span className="text-xs text-gray-500">
              {port.manufacturer}
              {port.serialNumber && ` • ${port.serialNumber}`}
            </span>
          )}
        </div>
      </Select.ItemText>
      <Select.ItemIndicator className="absolute left-1 w-4 h-4 inline-flex items-center justify-center">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
}
