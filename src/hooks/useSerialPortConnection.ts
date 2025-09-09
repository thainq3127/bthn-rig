import { api } from '~/trpc/react';

export function useSerialPortConnection() {
  // Hook để test connection to a serial port
  const testConnectionMutation = api.serialPort.testConnection.useMutation();
  
  // Hook để lấy thông tin chi tiết của port
  const getPortInfoQuery = api.serialPort.getPortInfo.useQuery;

  const testConnection = async (portPath: string, baudRate = 9600) => {
    try {
      const result = await testConnectionMutation.mutateAsync({
        portPath,
        baudRate
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    testConnection,
    isTestingConnection: testConnectionMutation.isPending,
    testConnectionError: testConnectionMutation.error?.message,
    getPortInfo: getPortInfoQuery,
  };
}
