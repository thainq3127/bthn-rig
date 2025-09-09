import { api } from '~/trpc/react';

export interface SerialPort {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export function useSerialPorts() {
  // Sử dụng tRPC query để fetch serial ports
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = api.serialPort.getSerialPorts.useQuery(undefined, {
    // Refetch every 5 seconds để cập nhật danh sách ports
    refetchInterval: 5000,
    // Refetch khi window focus
    refetchOnWindowFocus: true,
  });

  return {
    ports: data?.ports ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
    success: data?.success ?? false,
    count: data?.count ?? 0
  };
}
