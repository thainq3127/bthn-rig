/**
 * SmartShooter External API TypeScript Types
 * Converted from Python implementation
 */

// Enums
export enum Property {
  Aperture = "Aperture",
  ShutterSpeed = "ShutterSpeed",
  ISO = "ISO",
  Exposure = "Exposure",
  Quality = "Quality",
  ProgramMode = "ProgramMode",
  MeteringMode = "MeteringMode",
  FocusMode = "FocusMode",
  DriveMode = "DriveMode",
  WhiteBalance = "WhiteBalance",
  ColourTemperature = "ColourTemperature",
  Storage = "Storage",
  MirrorLockup = "MirrorLockup",
  PixelShiftMode = "PixelShiftMode",
  ControlMode = "ControlMode",
}

export enum CameraSelectionMode {
  All = "All",
  Single = "Single",
  Multiple = "Multiple",
  Group = "Group",
}

export enum PhotoSelectionMode {
  All = "All",
  Single = "Single",
  Multiple = "Multiple",
}

export enum ShutterButton {
  Off = "Off",
  Half = "Half",
  Full = "Full",
}

export enum CameraStatus {
  Absent = "Absent",
  Lost = "Lost",
  Disconnected = "Disconnected",
  Ready = "Ready",
  Busy = "Busy",
  Error = "Error",
}

export enum PowerSource {
  AC = "AC",
  Battery = "Battery",
  Unknown = "Unknown",
}

export enum PhotoLocation {
  Orphaned = "Orphaned",
  Deleted = "Deleted",
  Camera = "Camera",
  LocalDisk = "Local Disk",
}

export enum PhotoFormat {
  JPEG = "JPEG",
  PNG = "PNG",
  Raw = "Raw",
  TGA = "TGA",
  TIFF = "TIFF",
  Unknown = "Unknown",
}

export enum LiveviewFocusStep {
  Near1 = "Near1",
  Near2 = "Near2",
  Near3 = "Near3",
  Far1 = "Far1",
  Far2 = "Far2",
  Far3 = "Far3",
}

export enum PowerZoomDirection {
  Tele1 = "Tele1",
  Tele2 = "Tele2",
  Tele3 = "Tele3",
  Wide1 = "Wide1",
  Wide2 = "Wide2",
  Wide3 = "Wide3",
}

// Interfaces
export interface CameraPropertyInfo {
  CameraPropertyType: string;
  CameraPropertyValue: string;
  CameraPropertyIsWriteable: boolean;
  CameraPropertyRange: string[];
}

export interface CameraInfo {
  CameraKey: string;
  CameraStatus: CameraStatus;
  CameraName: string;
  CameraGroup: string;
  CameraTriggerIndex: string;
  CameraSerialNumber: string;
  CameraMake: string;
  CameraModel: string;
  CameraNumCards: number;
  PhotoBatchNum: number;
  CameraDateTimeOffset: number;
  CameraAutofocusIsSupported: boolean;
  CameraIsFocused: boolean;
  CameraLiveviewIsSupported: boolean;
  CameraLiveviewZoomIsSupported: boolean;
  CameraLiveviewDOFIsSupported: boolean;
  CameraLiveviewFocusIsSupported: boolean;
  CameraLiveviewIsEnabled: boolean;
  CameraLiveviewZoomIsEnabled: boolean;
  CameraLiveviewDOFIsEnabled: boolean;
  CameraLiveviewNumFrames: number;
  CameraLiveviewSensorWidth: number;
  CameraLiveviewSensorHeight: number;
  CameraLiveviewSensorRegionLeft: number;
  CameraLiveviewSensorRegionBottom: number;
  CameraLiveviewSensorRegionRight: number;
  CameraLiveviewSensorRegionTop: number;
  CameraLiveviewAFRegionLeft: number;
  CameraLiveviewAFRegionBottom: number;
  CameraLiveviewAFRegionRight: number;
  CameraLiveviewAFRegionTop: number;
  CameraVideoIsSupported: boolean;
  CameraVideoIsEnabled: boolean;
  CameraVideoElapsedTime: number;
  CameraBulbIsSupported: boolean;
  CameraBulbIsEnabled: boolean;
  CameraPowersource: PowerSource;
  CameraBatterylevel: number;
  CameraDownloadRate: number;
  CameraNumPhotosTaken: number;
  CameraNumPhotosFailed: number;
  CameraNumDownloadsComplete: number;
  CameraNumDownloadsFailed: number;
  CameraNumAutofocus: number;
  CameraPowerZoomPosition: number;
  CameraPowerZoomTarget: number;
  CameraPropertyInfo: Record<string, CameraPropertyInfo>;
  NodeKey?: string;
}

export interface PhotoInfo {
  PhotoKey: string;
  PhotoLocation: PhotoLocation;
  PhotoUUID: string;
  PhotoName: string;
  PhotoFilename: string;
  PhotoOriginalName: string;
  PhotoComputedName: string;
  PhotoDateCaptured: string;
  PhotoOrigin: string;
  PhotoFormat: PhotoFormat;
  PhotoOrientation: string;
  PhotoWidth: number;
  PhotoHeight: number;
  PhotoAperture: string;
  PhotoShutterSpeed: string;
  PhotoISO: string;
  PhotoFocalLength: string;
  PhotoFilesize: number;
  PhotoIsImage: boolean;
  PhotoIsHidden: boolean;
  PhotoIsScanned: boolean;
  PhotoHash: string;
  PhotoBarcode: string;
  PhotoSequenceNum: number;
  PhotoBatchNum: number;
  PhotoSessionNum: number;
  PhotoSessionName: string;
  CameraKey: string;
  NodeKey?: string;
}

export interface OptionsInfo {
  FilenameExpression: string;
  PhotoSessionName: string;
  PhotoSessionNum: number;
  UniqueTag: string;
  Barcode: string;
  DefaultStorage: string;
  DefaultControlMode: string;
  DefaultFocusMode: string;
  DefaultLiveviewFPS: number;
  DefaultVideoFPS: number;
  AutoConnect: boolean;
  AutoSynchroniseTime: boolean;
  AutoScanBarcode: boolean;
  DownloadPath: string;
  FallbackPath: string;
}

// Message types
export interface BaseMessage {
  msg_type: "Request" | "Response" | "Event";
  msg_id: string;
  msg_seq_num: number;
  msg_result?: boolean;
  msg_user_id?: number;
}

export interface SynchroniseResponse extends BaseMessage {
  msg_id: "Synchronise";
  CameraInfo: CameraInfo[];
  PhotoInfo: PhotoInfo[];
  OptionsInfo: OptionsInfo;
}

export interface CameraUpdatedEvent extends BaseMessage {
  msg_id: "CameraUpdated";
  msg_type: "Event";
  CameraKey: string;
  // Allow additional camera properties
  [key: string]: unknown;
}

export interface PhotoUpdatedEvent extends BaseMessage {
  msg_id: "PhotoUpdated";
  msg_type: "Event";
  PhotoKey: string;
  // Allow additional photo properties
  [key: string]: unknown;
}

export interface LiveviewUpdatedEvent extends BaseMessage {
  msg_id: "LiveviewUpdated";
  msg_type: "Event";
  CameraKey: string;
  CameraLiveviewImage: string; // base64 encoded JPEG
}

// Camera Selection Interface
export interface CameraSelectionFields {
  CameraSelection: CameraSelectionMode;
  CameraKey?: string;
  CameraKeys?: string[];
  CameraGroup?: string;
}

// Photo Selection Interface
export interface PhotoSelectionFields {
  PhotoSelection: PhotoSelectionMode;
  PhotoKey?: string;
  PhotoKeys?: string[];
}

// Request/Response Types
export interface ShootRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "Shoot";
  BulbTimer?: number;
  PhotoOrigin?: string;
}

export interface ConnectRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "Connect";
}

export interface DisconnectRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "Disconnect";
}

export interface AutofocusRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "Autofocus";
}

export interface SetPropertyRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "SetProperty";
  CameraPropertyType: string;
  CameraPropertyValue: string;
}

export interface SetShutterButtonRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "SetShutterButton";
  CameraShutterButton: ShutterButton;
}

export interface EnableLiveviewRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "EnableLiveview";
  Enable: boolean;
}

export interface LiveviewFocusRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "LiveviewFocus";
  CameraLiveviewFocusStep: LiveviewFocusStep;
}

export interface PowerZoomPositionRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "PowerZoomPosition";
  CameraPowerZoomPosition: number;
}

export interface PowerZoomStopRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "PowerZoomStop";
}

export interface GetCameraRequest extends BaseMessage, CameraSelectionFields {
  msg_id: "GetCamera";
}

export interface GetCameraResponse extends BaseMessage {
  msg_id: "GetCamera";
  CameraInfo: CameraInfo[];
}

// Configuration
export interface SmartShooterConfig {
  publisherAddress?: string;
  requestReplyAddress?: string;
  timeout?: number;
  autoReconnect?: boolean;
}
