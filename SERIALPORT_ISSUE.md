# Serial Port Integration Issue

## Problem
`serialport` package requires native binaries cho Node.js 24.7.0 trên Windows, nhưng gặp lỗi:
```
Error: No native build was found for platform=win32 arch=x64 runtime=node abi=137 uv=1 libc=glibc node=24.7.0
```

## Current Solution
Tạm thời sử dụng mock data trong `src/server/api/routers/serialPort.ts` để project có thể build và chạy được.

## To Fix Later
1. **Option 1: Install build tools**
   ```bash
   npm install --global windows-build-tools
   npm rebuild serialport
   ```

2. **Option 2: Use different Node.js version**
   - Switch to Node.js LTS version (18.x hoặc 20.x)
   - Reinstall serialport package

3. **Option 3: Use prebuild binaries**
   ```bash
   npm install @serialport/bindings-cpp --save-optional
   ```

4. **Option 4: Alternative packages**
   - Use `web-serial-api` for browser-based serial communication
   - Use `node-serialport` với compatibility layer

## Files Modified
- `src/server/api/routers/serialPort.ts`: Temporarily using mock data
- `src/components/Sidebar.tsx`: Added eslint disable for type safety

## When Fixed
1. Uncomment `import { SerialPort } from 'serialport';`
2. Replace mock data với real `SerialPort.list()` calls
3. Remove eslint disable comments
4. Test with real hardware

## Current Status
✅ Build working
✅ Dev server running  
✅ UI functional với mock data
❌ Real serial port detection (will fix later)
