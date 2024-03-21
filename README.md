# Litra-Automation
Simple node.js program that:
1. Checks for active webcam every 1.5 seconds (via registry trick, see appendix)
2. When camera becomes active, it activates the connected Litra Glow light (using the [litra module](https://github.com/timrogers/litra)https://github.com/timrogers/litra)). When camera becomes active, it turns off the Litra Glow.

It also creates a SysTray icon with manual controls for toggling the light, setting brightness, color temperature, and disabling the automation feature described above.

# Installing
1. `git clone https://github.com/mikepaer/litra-automation`
2. `cd litra-automation`
3. `npm install`

## Running
This application can be run 'windowed' (cmd prompt always visible on taskbar IN ADDITION TO the systray icon, showing logging messages in real time), or **windowless** (no cmd prompt, just the systray icon)

Running with cmd prompt: `node app`

Running windowlessly: `launcher-windowless.vbs`

## Autostart
Create a shortcut to `launcher-windowless.vbs` and place it in the `Startup` folder.
