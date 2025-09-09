import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SmartShooterContext } from "~/server/lib/smartshooter-api";

export const cameraRouter = createTRPCRouter({
  createCamera: publicProcedure.mutation(async () => {
    const smartShooter = new SmartShooterContext();
    try {
      await smartShooter.connect();
      smartShooter.selectAllCameras();
      await smartShooter.connect_cameras();
      return { success: true, message: "Camera connected successfully" };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      smartShooter.disconnect();
    }
  })
});
