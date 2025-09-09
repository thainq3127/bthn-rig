# SmartShooter External API - TypeScript Implementation

Đây là một implementation TypeScript hoàn chình của SmartShooter External API, được chuyển đổi từ implementation Python gốc để dễ dàng tích hợp với các dự án TypeScript/JavaScript.

## Tính năng

- ✅ **Type-safe**: Hoàn toàn typed với TypeScript
- ✅ **Modern async/await**: Sử dụng Promise thay vì callback
- ✅ **Easy to use**: API đơn giản và trực quan
- ✅ **Full compatibility**: Tương thích hoàn toàn với SmartShooter External API
- ✅ **Event handling**: Hỗ trợ đầy đủ event system
- ✅ **Camera control**: Điều khiển camera từ xa
- ✅ **Photo management**: Quản lý ảnh và download

## Cài đặt

Thư viện này đã được tích hợp sẵn vào dự án. Để sử dụng:

```typescript
import { SmartShooterContext, Property, ShutterButton } from '@/server/lib/smartshooter-api';
```

## Sử dụng cơ bản

### Kết nối và điều khiển camera

```typescript
import { SmartShooterContext, Property, ShutterButton } from '@/server/lib/smartshooter-api';

// Tạo instance SmartShooter
const smartShooter = new SmartShooterContext({
  requestReplyAddress: "tcp://127.0.0.1:54544",
  publisherAddress: "tcp://127.0.0.1:54543"
});

async function example() {
  try {
    // Kết nối
    await smartShooter.connect();
    
    // Chọn tất cả camera
    smartShooter.selectAllCameras();
    
    // Kết nối camera
    await smartShooter.connect_cameras();
    
    // Chụp ảnh
    await smartShooter.shoot();
    
    // Thay đổi cài đặt camera
    await smartShooter.setProperty(Property.ISO, "800");
    await smartShooter.setProperty(Property.Aperture, "f/5.6");
    
    // Bật liveview
    await smartShooter.enableLiveview(true);
    
    // Tự động focus
    await smartShooter.autofocus();
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    // Ngắt kết nối
    smartShooter.disconnect();
  }
}
```

### Quản lý nhiều camera

```typescript
// Lấy danh sách camera
const cameras = smartShooter.getCameraList();
console.log('Cameras:', cameras);

// Chọn camera cụ thể
smartShooter.selectCamera("camera_key_here");

// Chọn nhiều camera
smartShooter.selectCameras(["camera1", "camera2"]);

// Chọn camera theo group
smartShooter.selectCameraGroup("Group A");

// Lấy thông tin camera
const cameraInfo = smartShooter.getCameraInfo("camera_key");
if (cameraInfo) {
  console.log('Camera:', cameraInfo.CameraName);
  console.log('Status:', cameraInfo.CameraStatus);
  console.log('Battery:', cameraInfo.CameraBatterylevel);
}
```

### Quản lý ảnh

```typescript
// Lấy danh sách ảnh
const photos = smartShooter.getPhotoList();

// Chọn ảnh để download
smartShooter.selectAllPhotos();

// Download ảnh
await smartShooter.downloadPhotos();

// Xóa ảnh
smartShooter.selectPhoto("photo_key");
await smartShooter.deletePhotos(true); // true = xóa cả file
```

### Trigger và Latch

```typescript
// Engage trigger cho tất cả camera
await smartShooter.engageTrigger();

// Release trigger với delay
await smartShooter.releaseTrigger(100); // 100ms delay

// Cancel trigger
await smartShooter.cancelTrigger();

// Sử dụng latch
await smartShooter.engageLatch(1); // latch index 1
await smartShooter.releaseLatch(1);
```

### Kiểm tra trạng thái

```typescript
// Kiểm tra camera có kết nối không
if (smartShooter.isCameraConnected()) {
  console.log('Camera đã kết nối');
}

// Kiểm tra liveview có bật không
if (smartShooter.isLiveviewEnabled()) {
  console.log('Liveview đang bật');
}

// Lấy giá trị property
const currentISO = smartShooter.getProperty(Property.ISO);
const isoRange = smartShooter.getPropertyRange(Property.ISO);
console.log('Current ISO:', currentISO);
console.log('Available ISO values:', isoRange);
```

## API Reference

### SmartShooterContext

Lớp chính để điều khiển SmartShooter.

#### Constructor
```typescript
new SmartShooterContext(config?: SmartShooterConfig)
```

#### Phương thức kết nối
- `connect(): Promise<void>` - Kết nối tới SmartShooter
- `disconnect(): void` - Ngắt kết nối
- `synchronise(): Promise<void>` - Đồng bộ dữ liệu

#### Phương thức chọn camera
- `selectCamera(key: string): void`
- `selectCameras(keys: string[]): void`
- `selectAllCameras(): void`
- `selectCameraGroup(group: string): void`
- `getSelectedCameras(): string[]`

#### Phương thức điều khiển camera
- `connect_cameras(): Promise<BaseMessage>`
- `disconnect_cameras(): Promise<BaseMessage>`
- `shoot(bulbTimer?: number, photoOrigin?: string): Promise<BaseMessage>`
- `autofocus(): Promise<BaseMessage>`
- `setProperty(property: Property, value: string): Promise<BaseMessage>`
- `setShutterButton(button: ShutterButton): Promise<BaseMessage>`
- `enableLiveview(enable: boolean): Promise<BaseMessage>`

#### Phương thức quản lý ảnh
- `selectPhoto(key: string): void`
- `selectPhotos(keys: string[]): void`
- `selectAllPhotos(): void`
- `downloadPhotos(): Promise<BaseMessage>`
- `deletePhotos(deleteFiles?: boolean): Promise<BaseMessage>`

## Enums và Types

### Property
```typescript
enum Property {
  Aperture = "Aperture",
  ShutterSpeed = "ShutterSpeed",
  ISO = "ISO",
  // ... và nhiều properties khác
}
```

### ShutterButton
```typescript
enum ShutterButton {
  Off = "Off",
  Half = "Half",
  Full = "Full",
}
```

### CameraStatus
```typescript
enum CameraStatus {
  Absent = "Absent",
  Lost = "Lost",
  Disconnected = "Disconnected",
  Ready = "Ready",
  Busy = "Busy",
  Error = "Error",
}
```

## Lưu ý quan trọng

### WebSocket Implementation
Implementation hiện tại sử dụng WebSocket placeholder. Để sử dụng trong production, bạn cần:

1. **ZMQ-to-WebSocket Bridge**: Tạo một bridge server chuyển đổi ZMQ messages thành WebSocket
2. **Native ZMQ**: Sử dụng Node.js với ZMQ bindings cho server-side
3. **HTTP Proxy**: Tạo HTTP API wrapper cho ZMQ messages

### Ví dụ ZMQ Bridge Server (Node.js)

```javascript
// zmq-bridge-server.js
const zmq = require('zeromq');
const WebSocket = require('ws');

const reqSocket = zmq.socket('req');
const subSocket = zmq.socket('sub');

reqSocket.connect('tcp://127.0.0.1:54544');
subSocket.connect('tcp://127.0.0.1:54543');
subSocket.subscribe('');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // Handle WebSocket to ZMQ communication
  ws.on('message', (data) => {
    reqSocket.send(data);
  });
  
  reqSocket.on('message', (reply) => {
    ws.send(reply);
  });
  
  subSocket.on('message', (event) => {
    ws.send(event);
  });
});
```

## Error Handling

```typescript
try {
  await smartShooter.shoot();
} catch (error) {
  if (error.message.includes('Not connected')) {
    // Xử lý lỗi kết nối
    await smartShooter.connect();
  } else {
    // Xử lý lỗi khác
    console.error('Camera error:', error);
  }
}
```

## Best Practices

1. **Luôn ngắt kết nối**: Sử dụng try/finally để đảm bảo cleanup
2. **Kiểm tra trạng thái**: Kiểm tra camera status trước khi thực hiện thao tác
3. **Handle events**: Lắng nghe events để cập nhật UI real-time
4. **Error handling**: Luôn wrap async calls trong try/catch

## Troubleshooting

### Camera không kết nối được
- Kiểm tra SmartShooter có đang chạy không
- Kiểm tra địa chỉ IP và port
- Đảm bảo External API được bật trong SmartShooter

### Liveview không hoạt động
- Camera phải ở trạng thái "Ready"
- Một số camera cần kết nối USB
- Kiểm tra camera có hỗ trợ liveview không

### Performance issues
- Giới hạn số lượng event listeners
- Sử dụng debouncing cho UI updates
- Batch multiple camera operations

## License

MIT License - tương thích với implementation Python gốc.
