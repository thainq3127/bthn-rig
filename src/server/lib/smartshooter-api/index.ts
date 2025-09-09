/**
 * SmartShooter External API - TypeScript Implementation
 * 
 * A complete TypeScript implementation of the SmartShooter External API
 * that provides easy-to-use camera control and photo management functionality.
 * 
 * @example
 * ```typescript
 * import { SmartShooterContext, Property, ShutterButton } from './smartshooter-api';
 * 
 * const smartShooter = new SmartShooterContext({
 *   requestReplyAddress: "tcp://127.0.0.1:54544",
 *   publisherAddress: "tcp://127.0.0.1:54543"
 * });
 * 
 * await smartShooter.connect();
 * smartShooter.selectAllCameras();
 * await smartShooter.connect_cameras();
 * await smartShooter.shoot();
 * ```
 */

// Export main context class
export { SmartShooterContext } from "./context";

// Export selection classes
export { CameraSelection, PhotoSelection } from "./selection";

// Export message builder and state tracker for advanced usage
export { MessageBuilder } from "./message-builder";
export { StateTracker } from "./state-tracker";

// Export all types and enums
export * from "./types";

// Import for internal usage
import { SmartShooterContext } from "./context";
import type { SmartShooterConfig } from "./types";

// Export utility functions and helpers
export const createSmartShooterClient = (config?: SmartShooterConfig) => {
  return new SmartShooterContext(config);
};

// Default export for convenience
export default SmartShooterContext;
