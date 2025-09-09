/**
 * SmartShooter Camera and Photo Selection Classes
 * Converted from Python implementation
 */

import { CameraSelectionMode, PhotoSelectionMode } from "./types";

export class CameraSelection {
  private mode: CameraSelectionMode = CameraSelectionMode.All;
  private key: string | null = null;
  private keys: string[] | null = null;
  private group: string | null = null;

  selectCamera(key: string): void {
    this.mode = CameraSelectionMode.Single;
    this.key = key;
    this.keys = null;
    this.group = null;
  }

  selectCameras(keys: string[]): void {
    this.mode = CameraSelectionMode.Multiple;
    this.key = null;
    this.keys = keys;
    this.group = null;
  }

  selectAllCameras(): void {
    this.mode = CameraSelectionMode.All;
    this.key = null;
    this.keys = null;
    this.group = null;
  }

  selectCameraGroup(group: string): void {
    this.mode = CameraSelectionMode.Group;
    this.key = null;
    this.keys = null;
    this.group = group;
  }

  getMode(): CameraSelectionMode {
    return this.mode;
  }

  getKey(): string | null {
    return this.key;
  }

  getKeys(): string[] | null {
    return this.keys;
  }

  getGroup(): string | null {
    return this.group;
  }

  /**
   * Convert selection to message fields
   */
  toMessageFields(): {
    CameraSelection: string;
    CameraKey?: string;
    CameraKeys?: string[];
    CameraGroup?: string;
  } {
    const fields: {
      CameraSelection: string;
      CameraKey?: string;
      CameraKeys?: string[];
      CameraGroup?: string;
    } = {
      CameraSelection: this.mode,
    };

    if (this.mode === CameraSelectionMode.Single && this.key) {
      fields.CameraKey = this.key;
    } else if (this.mode === CameraSelectionMode.Multiple && this.keys) {
      fields.CameraKeys = this.keys;
    } else if (this.mode === CameraSelectionMode.Group && this.group) {
      fields.CameraGroup = this.group;
    }

    return fields;
  }
}

export class PhotoSelection {
  private mode: PhotoSelectionMode = PhotoSelectionMode.All;
  private key: string | null = null;
  private keys: string[] | null = null;

  selectPhoto(key: string): void {
    this.mode = PhotoSelectionMode.Single;
    this.key = key;
    this.keys = null;
  }

  selectPhotos(keys: string[]): void {
    this.mode = PhotoSelectionMode.Multiple;
    this.key = null;
    this.keys = keys;
  }

  selectAllPhotos(): void {
    this.mode = PhotoSelectionMode.All;
    this.key = null;
    this.keys = null;
  }

  getMode(): PhotoSelectionMode {
    return this.mode;
  }

  getKey(): string | null {
    return this.key;
  }

  getKeys(): string[] | null {
    return this.keys;
  }

  /**
   * Convert selection to message fields
   */
  toMessageFields(): {
    PhotoSelection: string;
    PhotoKey?: string;
    PhotoKeys?: string[];
  } {
    const fields: {
      PhotoSelection: string;
      PhotoKey?: string;
      PhotoKeys?: string[];
    } = {
      PhotoSelection: this.mode,
    };

    if (this.mode === PhotoSelectionMode.Single && this.key) {
      fields.PhotoKey = this.key;
    } else if (this.mode === PhotoSelectionMode.Multiple && this.keys) {
      fields.PhotoKeys = this.keys;
    }

    return fields;
  }
}
