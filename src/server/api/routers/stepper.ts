import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Board, Stepper, type StepperOption } from "johnny-five";

// Johnny-Five board and stepper instances
const boards = new Map<string, Board>();
const stepperInstances = new Map<
  string,
  {
    board: Board;
    stepper: Stepper;
    pins:
      | { step: number; dir: number }
      | { motor1: number; motor2: number; motor3: number; motor4: number };
    type: "TWO_WIRE" | "FOUR_WIRE";
    stepsPerRev: number;
    rpm: number;
    initialized: boolean;
  }
>();

// Helper function to connect to Arduino board
async function connectBoard(port: string): Promise<Board> {
  return new Promise((resolve, reject) => {
    const existingBoard = boards.get(port);
    if (existingBoard?.isReady) {
      resolve(existingBoard);
      return;
    }

    const board = new Board({ port, repl: false, debug: true });

    board.on("ready", () => {
      boards.set(port, board);
      console.log(`Johnny-Five board connected on ${port}`);
      resolve(board);
    });

    board.on("error", (error) => {
      console.error(`Johnny-Five board error on ${port}:`, error);
      reject(new Error(`Failed to connect to board: ${error.message}`));
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!board.isReady) {
        reject(new Error(`Board connection timeout on ${port}`));
      }
    }, 100000);
  });
}

export const stepperRouter = createTRPCRouter({
  initialize: publicProcedure
    .input(
      z.object({
        port: z.string(),
        type: z.enum(["TWO_WIRE", "FOUR_WIRE"]),
        pins: z.union([
          z.object({
            step: z.number().min(0).max(13),
            dir: z.number().min(0).max(13),
          }),
          z.object({
            motor1: z.number().min(0).max(13),
            motor2: z.number().min(0).max(13),
            motor3: z.number().min(0).max(13),
            motor4: z.number().min(0).max(13),
          }),
        ]),
        stepsPerRev: z.number().min(1),
        rpm: z.number().min(1).max(1000).optional().default(180),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Connect to Arduino board
        const board = await connectBoard(input.port);

        // Create stepper motor configuration
        let stepperConfig: StepperOption;

        if (input.type === "TWO_WIRE") {
          const pins = input.pins as { step: number; dir: number };
          stepperConfig = {
            type: Stepper.TYPE.DRIVER,
            stepsPerRev: input.stepsPerRev,
            pins: {
              step: pins.step,
              dir: pins.dir,
            },
          };
        } else {
          const pins = input.pins as {
            motor1: number;
            motor2: number;
            motor3: number;
            motor4: number;
          };
          stepperConfig = {
            type: Stepper.TYPE.FOUR_WIRE,
            stepsPerRev: input.stepsPerRev,
            pins: {
              motor1: pins.motor1,
              motor2: pins.motor2,
              motor3: pins.motor3,
              motor4: pins.motor4,
            },
          };
        }

        // Initialize stepper motor
        const stepper = new Stepper(stepperConfig);

        // Configure speed
        stepper.rpm(input.rpm);

        // Store the stepper instance
        stepperInstances.set(input.port, {
          board,
          stepper,
          pins: input.pins,
          type: input.type,
          stepsPerRev: input.stepsPerRev,
          rpm: input.rpm,
          initialized: true,
        });

        console.log(`Johnny-Five stepper initialized on port ${input.port}:`, {
          type: input.type,
          pins: input.pins,
          stepsPerRev: input.stepsPerRev,
          rpm: input.rpm,
        });

        return {
          success: true,
          message: `Stepper motor initialized on ${input.port}`,
          config: {
            type: input.type,
            pins: input.pins,
            stepsPerRev: input.stepsPerRev,
            rpm: input.rpm,
          },
        };
      } catch (error) {
        console.error("Stepper initialization error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to initialize stepper motor: ${errorMessage}`);
      }
    }),

  move: publicProcedure
    .input(
      z.object({
        port: z.string(),
        steps: z.number().min(1),
        direction: z.union([z.literal(0), z.literal(1)]), // 0=CCW, 1=CW
        rpm: z.number().min(1).max(1000).optional(),
        accel: z.number().min(0).optional(),
        decel: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const stepperInstance = stepperInstances.get(input.port);
        if (!stepperInstance?.initialized) {
          throw new Error(`Stepper not initialized on port ${input.port}`);
        }

        const { stepper } = stepperInstance;

        // Set speed if provided
        if (input.rpm) {
          stepper.rpm(input.rpm);
        }

        // Set direction (0=CCW, 1=CW)
        stepper.direction(input.direction);

        // Create step options
        const stepOptions: {
          steps: number;
          direction: number;
          rpm?: number;
          accel?: number;
          decel?: number;
        } = {
          steps: input.steps,
          direction: input.direction,
        };

        if (input.rpm) stepOptions.rpm = input.rpm;
        if (input.accel) stepOptions.accel = input.accel;
        if (input.decel) stepOptions.decel = input.decel;

        // Execute movement with Promise wrapper
        await new Promise<void>((resolve, reject) => {
          stepper.step(stepOptions, (error?: Error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });

        const direction = input.direction === 1 ? "CW" : "CCW";
        const rpm = input.rpm ?? stepperInstance.rpm;

        console.log(`Johnny-Five stepper moved on port ${input.port}:`, {
          steps: input.steps,
          direction,
          rpm,
          accel: input.accel,
          decel: input.decel,
        });

        // Calculate estimated time
        const movementTimeMs =
          (input.steps / stepperInstance.stepsPerRev) * (60000 / rpm);

        return {
          success: true,
          message: `Moved ${input.steps} steps ${direction} at ${rpm} RPM`,
          movement: {
            steps: input.steps,
            direction,
            rpm,
            accel: input.accel,
            decel: input.decel,
            estimatedTimeMs: movementTimeMs,
          },
        };
      } catch (error) {
        console.error("Stepper movement error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to move stepper motor: ${errorMessage}`);
      }
    }),

  getStatus: publicProcedure
    .input(
      z.object({
        port: z.string(),
      }),
    )
    .query(({ input }) => {
      const stepper = stepperInstances.get(input.port);
      return {
        initialized: stepper?.initialized ?? false,
        config: stepper
          ? {
              pins: stepper.pins,
              stepsPerRev: stepper.stepsPerRev,
              rpm: stepper.rpm,
            }
          : null,
      };
    }),

  disconnect: publicProcedure
    .input(
      z.object({
        port: z.string(),
      }),
    )
    .mutation(({ input }) => {
      try {
        const stepperInstance = stepperInstances.get(input.port);
        if (stepperInstance) {
          // Close board connection if exists
          const board = boards.get(input.port);
          if (board) {
            board.samplingInterval(0); // Stop sampling
            boards.delete(input.port);
          }
        }

        stepperInstances.delete(input.port);
        console.log(`Johnny-Five stepper disconnected from port ${input.port}`);

        return {
          success: true,
          message: `Stepper disconnected from ${input.port}`,
        };
      } catch (error) {
        console.error("Stepper disconnect error:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to disconnect stepper motor: ${errorMessage}`);
      }
    }),
});
