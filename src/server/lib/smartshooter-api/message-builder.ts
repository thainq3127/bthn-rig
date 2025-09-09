/**
 * SmartShooter Message Builder
 * Converts high-level API calls to JSON messages for the SmartShooter API
 */

import type { Property, ShutterButton, LiveviewFocusStep } from "./types";
import type { CameraSelection, PhotoSelection } from "./selection";

export class MessageBuilder {
  private seqNum = 0;

  private createMessage(msgId: string): Record<string, unknown> {
    return {
      msg_type: "Request",
      msg_id: msgId,
      msg_seq_num: this.seqNum++,
    };
  }

  private addCameraSelection(
    msg: Record<string, unknown>,
    selection: CameraSelection,
  ): void {
    const fields = selection.toMessageFields();
    Object.assign(msg, fields);
  }

  private addPhotoSelection(
    msg: Record<string, unknown>,
    selection: PhotoSelection,
  ): void {
    const fields = selection.toMessageFields();
    Object.assign(msg, fields);
  }

  buildSynchronise(): string {
    const msg = this.createMessage("Synchronise");
    return JSON.stringify(msg);
  }

  buildConnect(selection: CameraSelection): string {
    const msg = this.createMessage("Connect");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildDisconnect(selection: CameraSelection): string {
    const msg = this.createMessage("Disconnect");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildShoot(
    selection: CameraSelection,
    bulbTimer?: number,
    photoOrigin?: string,
  ): string {
    const msg = this.createMessage("Shoot");
    this.addCameraSelection(msg, selection);
    if (bulbTimer !== undefined) {
      msg.BulbTimer = bulbTimer;
    }
    if (photoOrigin !== undefined) {
      msg.PhotoOrigin = photoOrigin;
    }
    return JSON.stringify(msg);
  }

  buildAutofocus(selection: CameraSelection): string {
    const msg = this.createMessage("Autofocus");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildSetProperty(
    selection: CameraSelection,
    property: Property,
    value: string,
  ): string {
    const msg = this.createMessage("SetProperty");
    this.addCameraSelection(msg, selection);
    msg.CameraPropertyType = property;
    msg.CameraPropertyValue = value;
    return JSON.stringify(msg);
  }

  buildSetShutterButton(
    selection: CameraSelection,
    button: ShutterButton,
  ): string {
    const msg = this.createMessage("SetShutterButton");
    this.addCameraSelection(msg, selection);
    msg.CameraShutterButton = button;
    return JSON.stringify(msg);
  }

  buildEnableLiveview(selection: CameraSelection, enable: boolean): string {
    const msg = this.createMessage("EnableLiveview");
    this.addCameraSelection(msg, selection);
    msg.Enable = enable;
    return JSON.stringify(msg);
  }

  buildLiveviewFocus(
    selection: CameraSelection,
    focusStep: LiveviewFocusStep,
  ): string {
    const msg = this.createMessage("LiveviewFocus");
    this.addCameraSelection(msg, selection);
    msg.CameraLiveviewFocusStep = focusStep;
    return JSON.stringify(msg);
  }

  buildPowerZoomPosition(selection: CameraSelection, position: number): string {
    const msg = this.createMessage("PowerZoomPosition");
    this.addCameraSelection(msg, selection);
    msg.CameraPowerZoomPosition = position;
    return JSON.stringify(msg);
  }

  buildPowerZoomStop(selection: CameraSelection): string {
    const msg = this.createMessage("PowerZoomStop");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildEngageLatch(selection: CameraSelection, latchIndex: number): string {
    const msg = this.createMessage("EngageLatch");
    this.addCameraSelection(msg, selection);
    msg.CameraLatchIndex = latchIndex;
    return JSON.stringify(msg);
  }

  buildReleaseLatch(latchIndex: number): string {
    const msg = this.createMessage("ReleaseLatch");
    msg.CameraLatchIndex = latchIndex;
    return JSON.stringify(msg);
  }

  buildCancelLatch(latchIndex: number): string {
    const msg = this.createMessage("CancelLatch");
    msg.CameraLatchIndex = latchIndex;
    return JSON.stringify(msg);
  }

  buildEngageTrigger(selection: CameraSelection): string {
    const msg = this.createMessage("EngageTrigger");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildReleaseTrigger(triggerInterval: number): string {
    const msg = this.createMessage("ReleaseTrigger");
    msg.CameraTriggerInterval = triggerInterval;
    return JSON.stringify(msg);
  }

  buildCancelTrigger(): string {
    const msg = this.createMessage("CancelTrigger");
    return JSON.stringify(msg);
  }

  buildGetCamera(selection: CameraSelection): string {
    const msg = this.createMessage("GetCamera");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildDetectCameras(): string {
    const msg = this.createMessage("DetectCameras");
    return JSON.stringify(msg);
  }

  buildIdentify(selection: CameraSelection): string {
    const msg = this.createMessage("Identify");
    this.addCameraSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildSetBatchNum(batchNum: number): string {
    const msg = this.createMessage("SetBatchNum");
    msg.PhotoBatchNum = batchNum;
    return JSON.stringify(msg);
  }

  buildSetSequenceNum(sequenceNum: number): string {
    const msg = this.createMessage("SetSequenceNum");
    msg.PhotoSequenceNum = sequenceNum;
    return JSON.stringify(msg);
  }

  buildRenameCamera(selection: CameraSelection, name: string): string {
    const msg = this.createMessage("RenameCamera");
    this.addCameraSelection(msg, selection);
    msg.CameraName = name;
    return JSON.stringify(msg);
  }

  buildSetCameraGroup(selection: CameraSelection, group: string): string {
    const msg = this.createMessage("SetCameraGroup");
    this.addCameraSelection(msg, selection);
    msg.CameraGroup = group;
    return JSON.stringify(msg);
  }

  buildDownload(selection: PhotoSelection): string {
    const msg = this.createMessage("Download");
    this.addPhotoSelection(msg, selection);
    return JSON.stringify(msg);
  }

  buildDelete(selection: PhotoSelection, deleteFiles = true): string {
    const msg = this.createMessage("Delete");
    this.addPhotoSelection(msg, selection);
    msg.DeleteFiles = deleteFiles;
    return JSON.stringify(msg);
  }

  buildRenamePhoto(selection: PhotoSelection, name: string): string {
    const msg = this.createMessage("RenamePhoto");
    this.addPhotoSelection(msg, selection);
    msg.PhotoComputedName = name;
    return JSON.stringify(msg);
  }
}
