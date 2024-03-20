import { exec } from "child_process";
import { findDevice, isOn, turnOn, turnOff, toggle } from "litra";
import { create } from 'trayicon';

let cameraDetectionEnabled = true;
createSysTrayMenu();

// Create systray icon (optional)
function createSysTrayMenu() {
    create(function (tray) {

        // General tray properties
        tray.setTitle("Litra Light Tool");

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


        let toggleMenuItem = tray.item("Toggle light", () => toggleLight());

        let separatorMenuItem = tray.separator();

        let exitMenuItem = tray.item("Exit", () => process.exit());

        tray.setMenu(toggleMenuItem, separatorMenuItem, cameraDetectionMenuItem, separatorMenuItem, exitMenuItem);
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