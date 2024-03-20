import { exec } from "child_process";
import { findDevice, isOn, turnOn, turnOff, toggle, setBrightnessPercentage, setTemperatureInKelvin } from "litra";
import { create } from 'trayicon';
import { readFileSync } from 'fs';

let cameraDetectionEnabled = true;
createSysTrayMenu();

// Create systray icon (optional)

const iconFileOn = readFileSync('iconOn.png');
const iconFileOff = readFileSync('iconOff.png');

function createSysTrayMenu() {
    create(function (tray) {

        // General tray properties
        tray.setTitle("Litra Light Tool");

        let iconFile = cameraDetectionEnabled ? iconFileOn : iconFileOff;
        tray.setIcon(iconFile);

        let cameraDetectionMenuItem;
        cameraDetectionMenuItem = tray.item("Camera detection", {
            checked: cameraDetectionEnabled, bold: cameraDetectionEnabled, action: () => {
                cameraDetectionEnabled = !cameraDetectionEnabled;

                // So now if the detection is enabled...
                if (cameraDetectionEnabled) {
                    console.log("Creating loop");
                    main = createMainLoop();
                }
                else {
                    console.log("Clearing loop");
                    clearInterval(main);
                }
                tray.kill();
                createSysTrayMenu();
            }
        });

        let temperatureParentMenuItem = tray.item("Color temperature");
        temperatureParentMenuItem.add(tray.item("2700K", () => setTemp(2700)));
        temperatureParentMenuItem.add(tray.item("3000K", () => setTemp(3000)));
        temperatureParentMenuItem.add(tray.item("3300K", () => setTemp(3300)));
        temperatureParentMenuItem.add(tray.item("3600K", () => setTemp(3600)));
        temperatureParentMenuItem.add(tray.item("4000K", () => setTemp(4000)));
        temperatureParentMenuItem.add(tray.item("5000K", () => setTemp(5000)));
        temperatureParentMenuItem.add(tray.item("6500K", () => setTemp(6500)));

        let brightnessPercentMenuItem = tray.item("Brightness");
        brightnessPercentMenuItem.add(tray.item("20%", () => setBrightnessPercent(20)));
        brightnessPercentMenuItem.add(tray.item("30%", () => setBrightnessPercent(30)));
        brightnessPercentMenuItem.add(tray.item("40%", () => setBrightnessPercent(40)));
        brightnessPercentMenuItem.add(tray.item("50%", () => setBrightnessPercent(50)));
        brightnessPercentMenuItem.add(tray.item("60%", () => setBrightnessPercent(60)));
        brightnessPercentMenuItem.add(tray.item("70%", () => setBrightnessPercent(70)));
        brightnessPercentMenuItem.add(tray.item("80%", () => setBrightnessPercent(80)));
        brightnessPercentMenuItem.add(tray.item("90%", () => setBrightnessPercent(90)));
        brightnessPercentMenuItem.add(tray.item("100%", () => setBrightnessPercent(100)));

        let toggleMenuItem = tray.item("Toggle light", () => toggleLight());

        let separatorMenuItem = tray.separator();

        let exitMenuItem = tray.item("Exit", () => process.exit());

        tray.setMenu(toggleMenuItem, separatorMenuItem, temperatureParentMenuItem, brightnessPercentMenuItem, separatorMenuItem, cameraDetectionMenuItem, separatorMenuItem, exitMenuItem);
    });
}

function createMainLoop() {
    return setInterval(() => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing registry query: ${error.message}`);
                return;
            }

            //console.log(stdout);

            // Split the output by lines
            const lines = stdout.split('\n');

            // Check each line for the value
            let inUse = false;

            for (const line of lines) {
                //console.log("Line " + line);
                if (line.includes('LastUsedTimeStop')) {
                    const split = line.split("    ");
                    const value = split[3].trim();
                    if (value == '0x0') {
                        inUse = true;
                        break;
                    }
                }
            }

            // Print the result
            if (inUse != lastInUse) {
                if (inUse) {
                    // Initialize Litra device
                    console.log('⏺️ Camera is in use.');
                    turnOnLight();
                } else {
                    console.log('❌ Camera is not in use.');
                    turnOffLight();
                }
            }

            lastInUse = inUse;

        });

    }, 1500);
}

let main = createMainLoop();

// Registry path to check
const registryPath = 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam';

// Command to query registry value
const command = `reg query "${registryPath}" /s /v LastUsedTimeStop`;

var lastInUse = null;



function turnOnLight() {
    const device = findDevice();
    console.log('\t💡 Turning on Litra.');
    turnOn(device);
}

function turnOffLight() {
    const device = findDevice();
    console.log('\tTurning off Litra.');
    turnOff(device);
}

function toggleLight() {
    const device = findDevice();
    console.log('\Toggling Litra.');
    toggle(device);
}

// Note - there is no safety to this API. It should really check allowed values, but given arbitrary input is not allowed, no worries.
function setTemp(kelvin) {
    const device = findDevice();
    console.log("\tSetting color temp: ", kelvin);
    setTemperatureInKelvin(device, kelvin);
}

function setBrightnessPercent(percent) {
    const device = findDevice();
    console.log("\tSetting brightness percent: ", percent)
    setBrightnessPercentage(device, percent);
}