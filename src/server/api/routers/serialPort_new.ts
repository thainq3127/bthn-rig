import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// Tạm thời comment để test build
// import { SerialPort } from 'serialport';

export const serialPortRouter = createTRPCRouter({
  // Lấy danh sách serial ports
  getSerialPorts: publicProcedure
    .query(async () => {
      try {
        // Tạm thời sử dụng mock data để test build
        // TODO: Thay bằng SerialPort.list() khi fix được native binary issue
        const mockPorts = [
          {
            path: 'COM1',
            manufacturer: 'FTDI',
            serialNumber: 'FT12345',
            vendorId: '0403',
            productId: '6001',
            pnpId: 'FTDIBUS\\VID_0403+PID_6001+FT12345A\\0000'
          },
          {
            path: 'COM3', 
            manufacturer: 'Arduino LLC',
            serialNumber: 'ARD001',
            vendorId: '2341',
            productId: '0043',
            pnpId: 'USB\\VID_2341&PID_0043\\ARD001'
          }
        ];

        return {
          success: true,
          ports: mockPorts,
          count: mockPorts.length
        };
      } catch (error) {
        console.error('Error fetching serial ports:', error);
        return {
          success: false,
          ports: [],
          count: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  // Lấy thông tin chi tiết của một port
  getPortInfo: publicProcedure
    .input(z.object({ portPath: z.string() }))
    .query(async ({ input }) => {
      try {
        // Tạm thời sử dụng mock data để test build
        const mockPorts = [
          {
            path: 'COM1',
            manufacturer: 'FTDI',
            serialNumber: 'FT12345',
            vendorId: '0403',
            productId: '6001',
            pnpId: 'FTDIBUS\\VID_0403+PID_6001+FT12345A\\0000',
            isOpen: false,
            baudRate: null
          },
          {
            path: 'COM3', 
            manufacturer: 'Arduino LLC',
            serialNumber: 'ARD001',
            vendorId: '2341',
            productId: '0043',
            pnpId: 'USB\\VID_2341&PID_0043\\ARD001',
            isOpen: false,
            baudRate: null
          }
        ];
        
        const port = mockPorts.find(p => p.path === input.portPath);
        
        if (!port) {
          return {
            success: false,
            error: `Port ${input.portPath} not found`
          };
        }

        return {
          success: true,
          port
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  // Test connection to a port
  testConnection: publicProcedure
    .input(z.object({ 
      portPath: z.string(),
      baudRate: z.number().optional().default(9600)
    }))
    .mutation(async ({ input }) => {
      try {
        // Tạm thời simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          message: `Successfully connected to ${input.portPath} at ${input.baudRate} baud`,
          connectionTime: new Date().toISOString()
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        };
      }
    })
});
