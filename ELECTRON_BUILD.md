# Electron Build Configuration

## Cross-Platform Build Scripts

The Electron application is now configured to build for both Mac and Windows with the following commands:

### Development
```bash
# Start development mode (auto-reloads)
npm run desktop:dev

# Alternative development command
npm run desktop
```

### Building for Production

```bash
# Build for current platform only
npm run build:desktop

# Build specifically for Mac (requires macOS or CI/CD)
npm run build:desktop:mac

# Build specifically for Windows (can be run on any platform)
npm run build:desktop:win

# Build for all platforms (Mac, Windows, Linux)
npm run build:desktop:all
```

## Platform Support

### macOS
- **Output formats**: DMG installer, ZIP archive
- **Architectures**: Intel (x64) and Apple Silicon (arm64)
- **Requirements**: macOS 10.13+ for Intel, macOS 11.0+ for Apple Silicon

### Windows
- **Output formats**: NSIS installer, Portable executable
- **Architectures**: 64-bit (x64) and 32-bit (ia32)
- **Requirements**: Windows 7+ (x64), Windows 10+ recommended

### Linux (Bonus)
- **Output formats**: AppImage, Debian package (.deb)
- **Architectures**: 64-bit (x64)
- **Requirements**: Most modern Linux distributions

## Build Output

All built applications will be placed in the `dist/electron/` directory with descriptive filenames:
- `Farm Management System-1.0.0-mac-x64.dmg`
- `Farm Management System-1.0.0-mac-arm64.dmg`
- `Farm Management System-1.0.0-win-x64.exe`
- `Farm Management System-1.0.0-win-ia32.exe`

## Distribution

The built applications are standalone and can be distributed to users without requiring Node.js or any other dependencies to be installed on their machines.

## Code Signing (Optional)

For production releases, consider adding code signing:
- **macOS**: Apple Developer Certificate
- **Windows**: Code Signing Certificate from a trusted CA

Add to package.json build configuration:
```json
"mac": {
  "identity": "Developer ID Application: Your Name (XXXXXXXXXX)"
},
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```