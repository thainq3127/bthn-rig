/**
 * SmartShooter API Usage Examples
 * Các ví dụ sử dụng SmartShooter API trong TypeScript
 */

import { 
  SmartShooterContext, 
  Property, 
  ShutterButton, 
  CameraStatus,
  LiveviewFocusStep 
} from './index';

// Ví dụ 1: Kết nối và chụp ảnh cơ bản
export async function basicPhotographyExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    console.log('🔌 Đang kết nối tới SmartShooter...');
    await smartShooter.connect();
    
    console.log('📷 Chọn tất cả camera...');
    smartShooter.selectAllCameras();
    
    console.log('🔗 Kết nối camera...');
    await smartShooter.connect_cameras();
    
    // Đợi camera sẵn sàng
    await waitForCameraReady(smartShooter);
    
    console.log('📸 Chụp ảnh...');
    await smartShooter.shoot();
    
    console.log('✅ Hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 2: Cài đặt camera chi tiết
export async function advancedCameraSettingsExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    smartShooter.selectAllCameras();
    await smartShooter.connect_cameras();
    
    console.log('⚙️ Đang cài đặt camera...');
    
    // Cài đặt exposure
    await smartShooter.setProperty(Property.ISO, "400");
    await smartShooter.setProperty(Property.Aperture, "f/8");
    await smartShooter.setProperty(Property.ShutterSpeed, "1/125");
    
    // Cài đặt white balance
    await smartShooter.setProperty(Property.WhiteBalance, "Daylight");
    
    // Cài đặt chất lượng ảnh
    await smartShooter.setProperty(Property.DriveMode, "Single");
    
    // Kiểm tra cài đặt hiện tại
    const currentSettings = {
      iso: smartShooter.getProperty(Property.ISO),
      aperture: smartShooter.getProperty(Property.Aperture),
      shutter: smartShooter.getProperty(Property.ShutterSpeed),
      wb: smartShooter.getProperty(Property.WhiteBalance)
    };
    
    console.log('📋 Cài đặt hiện tại:', currentSettings);
    
    // Chụp với cài đặt mới
    await smartShooter.shoot();
    
  } catch (error) {
    console.error('❌ Lỗi cài đặt camera:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 3: Liveview và Focus
export async function liveviewFocusExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    smartShooter.selectAllCameras();
    await smartShooter.connect_cameras();
    
    console.log('📹 Bật liveview...');
    await smartShooter.enableLiveview(true);
    
    // Đợi liveview khởi động
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔍 Thực hiện autofocus...');
    await smartShooter.autofocus();
    
    // Manual focus adjustments
    console.log('🔧 Tinh chỉnh focus...');
    await smartShooter.moveFocus(LiveviewFocusStep.Near1);
    await new Promise(resolve => setTimeout(resolve, 500));
    await smartShooter.moveFocus(LiveviewFocusStep.Far2);
    
    console.log('📸 Chụp ảnh với liveview...');
    await smartShooter.shoot();
    
    console.log('📹 Tắt liveview...');
    await smartShooter.enableLiveview(false);
    
  } catch (error) {
    console.error('❌ Lỗi liveview:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 4: Quản lý nhiều camera
export async function multiCameraExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    
    // Lấy danh sách camera
    const cameras = smartShooter.getCameraList();
    console.log('📷 Tìm thấy camera:', cameras.length);
    
    if (cameras.length === 0) {
      throw new Error('Không tìm thấy camera nào');
    }
    
    // In thông tin từng camera
    cameras.forEach((cameraKey, index) => {
      const info = smartShooter.getCameraInfo(cameraKey);
      if (info) {
        console.log(`📷 Camera ${index + 1}:`);
        console.log(`   - Tên: ${info.CameraName}`);
        console.log(`   - Trạng thái: ${info.CameraStatus}`);
        console.log(`   - Pin: ${info.CameraBatterylevel}%`);
        console.log(`   - Group: ${info.CameraGroup}`);
      }
    });
    
    // Chọn và kết nối từng camera riêng biệt
    for (const cameraKey of cameras) {
      console.log(`🔗 Kết nối camera: ${cameraKey}`);
      smartShooter.selectCamera(cameraKey);
      await smartShooter.connect_cameras();
      
      // Kiểm tra trạng thái
      const info = smartShooter.getCameraInfo(cameraKey);
      if (info?.CameraStatus === CameraStatus.Ready) {
        console.log(`✅ Camera ${cameraKey} sẵn sàng`);
      }
    }
    
    // Chụp tất cả cùng lúc
    smartShooter.selectAllCameras();
    await smartShooter.shoot();
    
  } catch (error) {
    console.error('❌ Lỗi multi-camera:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 5: Trigger và Timing
export async function triggerTimingExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    smartShooter.selectAllCameras();
    await smartShooter.connect_cameras();
    
    console.log('⏱️ Trigger timing example...');
    
    // Pre-trigger preparation
    await smartShooter.setShutterButton(ShutterButton.Half);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Focus time
    
    // Engage trigger
    console.log('🔫 Engage trigger...');
    await smartShooter.engageTrigger();
    
    // Hold for action
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Release with precise timing
    console.log('📸 Release trigger...');
    await smartShooter.releaseTrigger(50); // 50ms delay
    
    // Clean up
    await smartShooter.setShutterButton(ShutterButton.Off);
    
  } catch (error) {
    console.error('❌ Lỗi trigger timing:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 6: Quản lý và Download ảnh
export async function photoManagementExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    smartShooter.selectAllCameras();
    await smartShooter.connect_cameras();
    
    // Chụp một vài ảnh
    console.log('📸 Chụp ảnh test...');
    await smartShooter.shoot();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await smartShooter.shoot();
    
    // Sync để lấy danh sách ảnh mới
    console.log('🔄 Đồng bộ danh sách ảnh...');
    await smartShooter.synchronise();
    
    // Lấy danh sách ảnh
    const photos = smartShooter.getPhotoList();
    console.log(`📋 Tìm thấy ${photos.length} ảnh`);
    
    if (photos.length > 0) {
      // In thông tin ảnh
      photos.forEach((photoKey, index) => {
        const info = smartShooter.getPhotoInfo(photoKey);
        if (info) {
          console.log(`📷 Ảnh ${index + 1}:`);
          console.log(`   - Tên: ${info.PhotoFilename}`);
          console.log(`   - Kích thước: ${info.PhotoFilesize} bytes`);
          console.log(`   - Định dạng: ${info.PhotoFormat}`);
        }
      });
      
      // Chọn và download tất cả ảnh
      console.log('⬇️ Downloading ảnh...');
      smartShooter.selectAllPhotos();
      await smartShooter.downloadPhotos();
      
      console.log('✅ Download hoàn thành!');
      
      // Tùy chọn: Xóa ảnh trên camera (cẩn thận!)
      // console.log('🗑️ Xóa ảnh trên camera...');
      // await smartShooter.deletePhotos(false); // false = chỉ xóa reference, không xóa file
    }
    
  } catch (error) {
    console.error('❌ Lỗi quản lý ảnh:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Ví dụ 7: Event Handling (nếu có WebSocket implementation)
export async function eventHandlingExample() {
  const smartShooter = new SmartShooterContext();
  
  try {
    await smartShooter.connect();
    
    // Lắng nghe events (tùy thuộc vào WebSocket implementation)
    console.log('👂 Lắng nghe events...');
    
    // Simulated event handling (for demonstration only)
    // const eventHandler = (event: BaseMessage) => {
    //   console.log('📢 Nhận event:', event);
    //   // Event handling implementation would depend on WebSocket setup
    // };
    
    // Note: Event handling requires WebSocket implementation
    console.log('ℹ️ Event handling cần WebSocket implementation');
    
    // Register event handler (implementation dependent)
    // smartShooter.onEvent(eventHandler);
    
    smartShooter.selectAllCameras();
    await smartShooter.connect_cameras();
    
    // Thực hiện các thao tác và quan sát events
    await smartShooter.shoot();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Lỗi event handling:', error);
  } finally {
    smartShooter.disconnect();
  }
}

// Utility function: Đợi camera sẵn sàng
async function waitForCameraReady(smartShooter: SmartShooterContext, timeoutMs = 10000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const cameras = smartShooter.getSelectedCameras();
    let allReady = true;
    
    for (const cameraKey of cameras) {
      const info = smartShooter.getCameraInfo(cameraKey);
      if (!info || info.CameraStatus !== CameraStatus.Ready) {
        allReady = false;
        break;
      }
    }
    
    if (allReady) {
      console.log('✅ Tất cả camera đã sẵn sàng');
      return;
    }
    
    console.log('⏳ Đang đợi camera sẵn sàng...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Timeout: Camera không sẵn sàng');
}

// Ví dụ chạy tất cả demos
export async function runAllExamples() {
  console.log('🚀 Bắt đầu demo SmartShooter API...\n');
  
  try {
    console.log('=== Ví dụ 1: Photography cơ bản ===');
    await basicPhotographyExample();
    
    console.log('\n=== Ví dụ 2: Cài đặt camera nâng cao ===');
    await advancedCameraSettingsExample();
    
    console.log('\n=== Ví dụ 3: Liveview và Focus ===');
    await liveviewFocusExample();
    
    console.log('\n=== Ví dụ 4: Multi-camera ===');
    await multiCameraExample();
    
    console.log('\n=== Ví dụ 5: Trigger timing ===');
    await triggerTimingExample();
    
    console.log('\n=== Ví dụ 6: Quản lý ảnh ===');
    await photoManagementExample();
    
    console.log('\n✅ Tất cả demo hoàn thành!');
    
  } catch (error) {
    console.error('\n❌ Lỗi trong quá trình demo:', error);
  }
}

// Export cho sử dụng bên ngoài
export {
  waitForCameraReady
};

// Uncomment để chạy demo
// runAllExamples();
