const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const androidSdk = process.env.ANDROID_HOME || path.join(localAppData, 'Android', 'Sdk');
const platformTools = path.join(androidSdk, 'platform-tools');
const emulatorDir = path.join(androidSdk, 'emulator');

let extraPath = '';
if (fs.existsSync(platformTools)) extraPath += platformTools + path.delimiter;
if (fs.existsSync(emulatorDir)) extraPath += emulatorDir + path.delimiter;

const env = {
    ...process.env,
    PATH: extraPath + (process.env.PATH || ''),
    ANDROID_HOME: androidSdk,
    NODE_OPTIONS: (process.env.NODE_OPTIONS || '') + ' --no-warnings'
};

console.log('\x1b[36m%s\x1b[0m', '→ Checking Android SDK Paths...');
if (extraPath) {
    console.log('\x1b[32m%s\x1b[0m', '✔ Injected ADB and Emulator into PATH');
} else {
    console.log('\x1b[33m%s\x1b[0m', '⚠ Warning: Android SDK tools not found at default location');
}

try {
    execSync('npx react-native run-android', {
        stdio: 'inherit',
        env
    });
} catch (error) {
    // Error is already printed by stdio: 'inherit'
    process.exit(1);
}
