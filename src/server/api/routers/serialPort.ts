/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SerialPort } from 'serialport';

// Type for SerialPort list results
interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export const serialPortRouter = createTRPCRouter({
  // Lấy danh sách serial ports
  getSerialPorts: publicProcedure
    .query(async () => {
      try {
        // Sử dụng SerialPort.list() để lấy danh sách ports thật
        const ports = await SerialPort.list();
        
        // Transform data với type safety
        const transformedPorts = ports.map((port): SerialPortInfo => ({
          path: port.path,
          manufacturer: port.manufacturer,
          serialNumber: port.serialNumber,
          pnpId: port.pnpId,
          locationId: port.locationId,
          vendorId: port.vendorId,
          productId: port.productId,
        }));

        return {
          success: true,
          ports: transformedPorts,
          count: transformedPorts.length
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
        // Lấy tất cả ports và tìm port cụ thể
        const ports = await SerialPort.list();
        const port = ports.find((p) => p.path === input.portPath);
        
        if (!port) {
          return {
            success: false,
            error: `Port ${input.portPath} not found`
          };
        }

        return {
          success: true,
          port: {
            path: port.path,
            manufacturer: port.manufacturer,
            serialNumber: port.serialNumber,
            vendorId: port.vendorId,
            productId: port.productId,
            pnpId: port.pnpId,
            locationId: port.locationId,
            isOpen: false, // SerialPort.list() không cung cấp thông tin này
            baudRate: null // Thông tin này chỉ có khi port đang mở
          }
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
        // Thử mở port để test connection
        const port = new SerialPort({ 
          path: input.portPath, 
          baudRate: input.baudRate,
          autoOpen: false 
        });
        
        // Mở port
        await new Promise<void>((resolve, reject) => {
          port.open((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        // Đóng port ngay sau khi test thành công
        await new Promise<void>((resolve, reject) => {
          port.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
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
