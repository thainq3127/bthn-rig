/**
 * SmartShooter State Tracker
 * Manages the local state of cameras and photos from Smart Shooter events
 */

import type {
  CameraInfo,
  PhotoInfo,
  OptionsInfo,
  BaseMessage,
  SynchroniseResponse,
  CameraUpdatedEvent,
  PhotoUpdatedEvent,
} from "./types";
import { CameraStatus, CameraSelectionMode, PhotoSelectionMode } from "./types";
import type { CameraSelection, PhotoSelection } from "./selection";

export class StateTracker {
  private isSynchronised = false;
  private cameras = new Map<string, CameraInfo>();
  private photos = new Map<string, PhotoInfo>();
  private options: OptionsInfo | null = null;

  isSynchronized(): boolean {
    return this.isSynchronised;
  }

  invalidate(): void {
    this.isSynchronised = false;
  }

  private readSynchronise(msg: SynchroniseResponse): void {
    this.isSynchronised = true;
    
    // Clear existing data
    this.cameras.clear();
    this.photos.clear();
    
    // Process cameras
    for (const camera of msg.CameraInfo) {
      this.cameras.set(camera.CameraKey, camera);
    }
    
    // Process photos
    for (const photo of msg.PhotoInfo) {
      this.photos.set(photo.PhotoKey, photo);
    }
    
    // Store options
    this.options = msg.OptionsInfo;
  }

  private readCameraUpdated(msg: CameraUpdatedEvent): void {
    const key = msg.CameraKey;
    
    if (!this.cameras.has(key)) {
      // Initialize new camera with empty property info
      this.cameras.set(key, {
        CameraKey: key,
        CameraPropertyInfo: {},
      } as CameraInfo);
    }
    
    const camera = this.cameras.get(key)!;
    
    // Update all fields from the message using Object.assign for simplicity
    Object.assign(camera, msg);
  }

  private readPhotoUpdated(msg: PhotoUpdatedEvent): void {
    const key = msg.PhotoKey;
    
    if (!this.photos.has(key)) {
      this.photos.set(key, {} as PhotoInfo);
    }
    
    const photo = this.photos.get(key)!;
    
    // Update all fields from the message
    Object.assign(photo, msg);
  }

  processReply(msg: BaseMessage): void {
    if (msg.msg_id === "Synchronise") {
      this.readSynchronise(msg as SynchroniseResponse);
    }
  }

  processEvent(msg: BaseMessage): void {
    if (msg.msg_id === "CameraUpdated") {
      this.readCameraUpdated(msg as CameraUpdatedEvent);
    } else if (msg.msg_id === "PhotoUpdated") {
      this.readPhotoUpdated(msg as PhotoUpdatedEvent);
    }
    // Add more event types as needed
  }

  getCameraList(): string[] {
    return Array.from(this.cameras.keys());
  }

  getPhotoList(): string[] {
    return Array.from(this.photos.keys());
  }

  getCameraInfo(key: string): CameraInfo | undefined {
    return this.cameras.get(key);
  }

  getPhotoInfo(key: string): PhotoInfo | undefined {
    return this.photos.get(key);
  }

  getOptions(): OptionsInfo | null {
    return this.options;
  }

  getSelectedCameras(selection: CameraSelection): string[] {
    const mode = selection.getMode();
    
    if (mode === CameraSelectionMode.All) {
      return this.getCameraList();
    } else if (mode === CameraSelectionMode.Single) {
      const key = selection.getKey();
      return key ? [key] : [];
    } else if (mode === CameraSelectionMode.Multiple) {
      const keys = selection.getKeys();
      return keys ?? [];
    } else if (mode === CameraSelectionMode.Group) {
      const group = selection.getGroup();
      if (!group) return [];
      
      const selectedCameras: string[] = [];
      for (const [key, camera] of this.cameras.entries()) {
        if (camera.CameraGroup === group) {
          selectedCameras.push(key);
        }
      }
      return selectedCameras;
    }
    return [];
  }

  getSelectedPhotos(selection: PhotoSelection): string[] {
    const mode = selection.getMode();
    
    if (mode === PhotoSelectionMode.All) {
      return this.getPhotoList();
    } else if (mode === PhotoSelectionMode.Single) {
      const key = selection.getKey();
      return key ? [key] : [];
    } else if (mode === PhotoSelectionMode.Multiple) {
      const keys = selection.getKeys();
      return keys ?? [];
    }
    return [];
  }

  private isCameraConnected(key: string): boolean {
    const camera = this.cameras.get(key);
    if (!camera) return false;
    return camera.CameraStatus === CameraStatus.Ready || camera.CameraStatus === CameraStatus.Busy;
  }

  private getActiveCamera(selection: CameraSelection): string | null {
    const mode = selection.getMode();
    
    if (mode === CameraSelectionMode.All) {
      for (const key of this.cameras.keys()) {
        if (this.isCameraConnected(key)) {
          return key;
        }
      }
    } else if (mode === CameraSelectionMode.Single) {
      return selection.getKey();
    } else if (mode === CameraSelectionMode.Multiple) {
      const keys = selection.getKeys();
      if (keys) {
        for (const key of keys) {
          if (this.isCameraConnected(key)) {
            return key;
          }
        }
      }
    } else if (mode === CameraSelectionMode.Group) {
      const group = selection.getGroup();
      if (group) {
        for (const [key, camera] of this.cameras.entries()) {
          if (this.isCameraConnected(key) && camera.CameraGroup === group) {
            return key;
          }
        }
      }
    }
    return null;
  }

  getProperty(selection: CameraSelection, property: string): string | null {
    const key = this.getActiveCamera(selection);
    if (!key) return null;
    
    const camera = this.cameras.get(key);
    if (!camera?.CameraPropertyInfo[property]) return null;
    
    return camera.CameraPropertyInfo[property].CameraPropertyValue;
  }

  getPropertyRange(selection: CameraSelection, property: string): string[] | null {
    const key = this.getActiveCamera(selection);
    if (!key) return null;
    
    const camera = this.cameras.get(key);
    if (!camera?.CameraPropertyInfo[property]) return null;
    
    return camera.CameraPropertyInfo[property].CameraPropertyRange;
  }
}
