import { exec } from "child_process";
import { findDevice, isOn, turnOn, turnOff } from "litra";
import { create } from 'trayicon';

// Initialize Litra device
const device = findDevice();

// Create systray icon (optional)
create(function(tray) {
  let trayOn = tray.item("Light on", () => turnOn(device));
  let trayOff = tray.item("Light off", () => turnOff(device));
  //power.add(tray.item("on"), tray.item("on"));
  let separator = tray.separator();

  let quit = tray.item("Quit", () => process.exit());
  tray.setMenu(trayOn, trayOff, separator, quit);
});

// Registry path to check
const registryPath = 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam';

// Command to query registry value
const command = `reg query "${registryPath}" /s /v LastUsedTimeStop`;

var lastInUse = null;

setInterval(() => {
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
                console.log('⏺️ Camera is in use. Turning on Litra.');
                turnOn(device);
            } else {
                console.log('❌ Camera is not in use. Turning off Litra.');
                turnOff(device);
            }
        }

        lastInUse = inUse;

    });

}, 1500)