/**
 * SmartShooter Context - Main Client for SmartShooter API
 * TypeScript implementation with modern async/await patterns
 */

import type {
  SmartShooterConfig,
  CameraInfo,
  PhotoInfo,
  OptionsInfo,
  Property,
  ShutterButton,
  LiveviewFocusStep,
  BaseMessage,
} from "./types";
import { CameraStatus } from "./types";
import { MessageBuilder } from "./message-builder";
import { StateTracker } from "./state-tracker";
import { CameraSelection, PhotoSelection } from "./selection";

interface SocketInterface {
  sendRequest(msg: string): Promise<void>;
  receiveReply(): Promise<string>;
  receiveEvent(): Promise<string | null>;
  close(): void;
}

// Simple WebSocket-based implementation for browser/Node.js
class WebSocketClient implements SocketInterface {
  private reqSocket: WebSocket | null = null;
  private subSocket: WebSocket | null = null;
  private requestReplyAddress: string;
  private publisherAddress: string;

  constructor(requestReplyAddress: string, publisherAddress: string) {
    this.requestReplyAddress = requestReplyAddress;
    this.publisherAddress = publisherAddress;
  }

  async connect(): Promise<void> {
    // Note: This is a simplified implementation
    // In a real WebSocket implementation, you'd need to handle the ZMQ REQ/REP and PUB/SUB patterns
    // which may require a WebSocket proxy server that bridges to ZMQ
    throw new Error("WebSocket implementation requires a ZMQ-to-WebSocket bridge server");
  }

  async sendRequest(msg: string): Promise<void> {
    if (!this.reqSocket) throw new Error("Request socket not connected");
    this.reqSocket.send(msg);
  }

  async receiveReply(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.reqSocket) {
        reject(new Error("Request socket not connected"));
        return;
      }
      
      const handler = (event: MessageEvent) => {
        this.reqSocket!.removeEventListener("message", handler);
        resolve(event.data as string);
      };
      
      this.reqSocket.addEventListener("message", handler);
    });
  }

  async receiveEvent(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.subSocket) {
        resolve(null);
        return;
      }
      
      const handler = (event: MessageEvent) => {
        this.subSocket!.removeEventListener("message", handler);
        resolve(event.data as string | null);
      };
      
      this.subSocket.addEventListener("message", handler);
    });
  }

  close(): void {
    this.reqSocket?.close();
    this.subSocket?.close();
  }
}

export class SmartShooterContext {
  private config: SmartShooterConfig;
  private messageBuilder: MessageBuilder;
  private stateTracker: StateTracker;
  private cameraSelection: CameraSelection;
  private photoSelection: PhotoSelection;
  private socket: SocketInterface | null = null;
  private isConnected = false;

  constructor(config: SmartShooterConfig = {}) {
    this.config = {
      publisherAddress: config.publisherAddress ?? "tcp://127.0.0.1:54543",
      requestReplyAddress: config.requestReplyAddress ?? "tcp://127.0.0.1:54544",
      timeout: config.timeout ?? 5000,
      autoReconnect: config.autoReconnect ?? true,
    };

    this.messageBuilder = new MessageBuilder();
    this.stateTracker = new StateTracker();
    this.cameraSelection = new CameraSelection();
    this.photoSelection = new PhotoSelection();
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    this.socket = new WebSocketClient(
      this.config.requestReplyAddress!,
      this.config.publisherAddress!,
    );

    await (this.socket as WebSocketClient).connect();
    this.isConnected = true;

    // Perform initial synchronization
    await this.synchronise();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  private async transact(msg: string): Promise<BaseMessage> {
    if (!this.socket) throw new Error("Not connected to SmartShooter");

    // Read any pending events first
    await this.readEvents();

    // Send request and get reply
    await this.socket.sendRequest(msg);
    const replyStr = await this.socket.receiveReply();
    const reply = JSON.parse(replyStr) as BaseMessage;

    // Process the reply through state tracker
    this.stateTracker.processReply(reply);

    return reply;
  }

  private async readEvents(): Promise<void> {
    if (!this.socket) return;

    let event;
    do {
      event = await this.socket.receiveEvent();
      if (event) {
        const eventObj = JSON.parse(event) as BaseMessage;
        this.stateTracker.processEvent(eventObj);
      }
    } while (event);
  }

  async wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async waitForLiveview(): Promise<void> {
    // Wait for liveview to be enabled and receive frames
    // This is a simplified implementation
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const cameras = this.getSelectedCameras();
      let allReady = true;

      for (const cameraKey of cameras) {
        const camera = this.getCameraInfo(cameraKey);
        if (!camera?.CameraLiveviewIsEnabled) {
          allReady = false;
          break;
        }
      }

      if (allReady) return;
      await this.wait(100);
    }

    throw new Error("Timeout waiting for liveview");
  }

  // Synchronization
  async synchronise(): Promise<void> {
    this.stateTracker.invalidate();
    const msg = this.messageBuilder.buildSynchronise();
    await this.transact(msg);
  }

  // Camera selection methods
  selectCamera(key: string): void {
    this.cameraSelection.selectCamera(key);
  }

  selectCameras(keys: string[]): void {
    this.cameraSelection.selectCameras(keys);
  }

  selectAllCameras(): void {
    this.cameraSelection.selectAllCameras();
  }

  selectCameraGroup(group: string): void {
    this.cameraSelection.selectCameraGroup(group);
  }

  getSelectedCameras(): string[] {
    return this.stateTracker.getSelectedCameras(this.cameraSelection);
  }

  // Photo selection methods
  selectPhoto(key: string): void {
    this.photoSelection.selectPhoto(key);
  }

  selectPhotos(keys: string[]): void {
    this.photoSelection.selectPhotos(keys);
  }

  selectAllPhotos(): void {
    this.photoSelection.selectAllPhotos();
  }

  getSelectedPhotos(): string[] {
    return this.stateTracker.getSelectedPhotos(this.photoSelection);
  }

  // Data access methods
  getCameraList(): string[] {
    return this.stateTracker.getCameraList();
  }

  getPhotoList(): string[] {
    return this.stateTracker.getPhotoList();
  }

  getCameraInfo(key: string): CameraInfo | undefined {
    return this.stateTracker.getCameraInfo(key);
  }

  getPhotoInfo(key: string): PhotoInfo | undefined {
    return this.stateTracker.getPhotoInfo(key);
  }

  getOptions(): OptionsInfo | null {
    return this.stateTracker.getOptions();
  }

  // Camera control methods
  async connect_cameras(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildConnect(this.cameraSelection);
    return this.transact(msg);
  }

  async disconnect_cameras(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildDisconnect(this.cameraSelection);
    return this.transact(msg);
  }

  async shoot(bulbTimer?: number, photoOrigin = "api"): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildShoot(this.cameraSelection, bulbTimer, photoOrigin);
    return this.transact(msg);
  }

  async autofocus(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildAutofocus(this.cameraSelection);
    return this.transact(msg);
  }

  async setProperty(property: Property, value: string): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildSetProperty(this.cameraSelection, property, value);
    return this.transact(msg);
  }

  async setShutterButton(button: ShutterButton): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildSetShutterButton(this.cameraSelection, button);
    return this.transact(msg);
  }

  async enableLiveview(enable: boolean): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildEnableLiveview(this.cameraSelection, enable);
    return this.transact(msg);
  }

  async moveFocus(focusStep: LiveviewFocusStep): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildLiveviewFocus(this.cameraSelection, focusStep);
    return this.transact(msg);
  }

  async positionPowerZoom(position: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildPowerZoomPosition(this.cameraSelection, position);
    return this.transact(msg);
  }

  async stopPowerZoom(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildPowerZoomStop(this.cameraSelection);
    return this.transact(msg);
  }

  // Trigger and latch methods
  async engageLatch(latchIndex: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildEngageLatch(this.cameraSelection, latchIndex);
    return this.transact(msg);
  }

  async releaseLatch(latchIndex: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildReleaseLatch(latchIndex);
    return this.transact(msg);
  }

  async cancelLatch(latchIndex: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildCancelLatch(latchIndex);
    return this.transact(msg);
  }

  async engageTrigger(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildEngageTrigger(this.cameraSelection);
    return this.transact(msg);
  }

  async releaseTrigger(triggerInterval: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildReleaseTrigger(triggerInterval);
    return this.transact(msg);
  }

  async cancelTrigger(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildCancelTrigger();
    return this.transact(msg);
  }

  // Utility methods
  async detectCameras(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildDetectCameras();
    return this.transact(msg);
  }

  async identify(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildIdentify(this.cameraSelection);
    return this.transact(msg);
  }

  async setBatchNum(batchNum: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildSetBatchNum(batchNum);
    return this.transact(msg);
  }

  async setSequenceNum(sequenceNum: number): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildSetSequenceNum(sequenceNum);
    return this.transact(msg);
  }

  async renameCamera(name: string): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildRenameCamera(this.cameraSelection, name);
    return this.transact(msg);
  }

  async setCameraGroup(group: string): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildSetCameraGroup(this.cameraSelection, group);
    return this.transact(msg);
  }

  // Photo management
  async downloadPhotos(): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildDownload(this.photoSelection);
    return this.transact(msg);
  }

  async deletePhotos(deleteFiles = true): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildDelete(this.photoSelection, deleteFiles);
    return this.transact(msg);
  }

  async renamePhoto(name: string): Promise<BaseMessage> {
    const msg = this.messageBuilder.buildRenamePhoto(this.photoSelection, name);
    return this.transact(msg);
  }

  // Property access
  getProperty(property: Property): string | null {
    return this.stateTracker.getProperty(this.cameraSelection, property);
  }

  getPropertyRange(property: Property): string[] | null {
    return this.stateTracker.getPropertyRange(this.cameraSelection, property);
  }

  // Status checks
  isCameraConnected(): boolean {
    const cameras = this.getSelectedCameras();
    for (const cameraKey of cameras) {
      const camera = this.getCameraInfo(cameraKey);
      if (!camera || (camera.CameraStatus !== CameraStatus.Ready && camera.CameraStatus !== CameraStatus.Busy)) {
        return false;
      }
    }
    return cameras.length > 0;
  }

  isLiveviewEnabled(): boolean {
    const cameras = this.getSelectedCameras();
    for (const cameraKey of cameras) {
      const camera = this.getCameraInfo(cameraKey);
      if (!camera?.CameraLiveviewIsEnabled) {
        return false;
      }
    }
    return cameras.length > 0;
  }
}
