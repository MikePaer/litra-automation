import { exec } from 'child_process'
import {
  findDevice,
  turnOn,
  turnOff,
  toggle,
  setBrightnessPercentage,
  setTemperatureInKelvin
} from 'litra'
import { create } from 'trayicon'
import { readFileSync } from 'fs'

let cameraDetectionEnabled = true

createSysTrayMenu()

// Create systray icon (optional)
const iconFileOn = readFileSync('iconOn.png')
const iconFileOff = readFileSync('iconOff.png')

function createSysTrayMenu () {
  create(function (tray) {
    // General tray properties
    tray.setTitle('Litra Light Tool')

    let iconFile = cameraDetectionEnabled ? iconFileOn : iconFileOff
    tray.setIcon(iconFile)

    let cameraDetectionMenuItem
    cameraDetectionMenuItem = tray.item('Camera detection', {
      checked: cameraDetectionEnabled,
      bold: cameraDetectionEnabled,
      action: () => {
        cameraDetectionEnabled = !cameraDetectionEnabled

        // So now if the detection is enabled...
        if (cameraDetectionEnabled) {
          console.log('Creating loop')
          main = createMainLoop()
        } else {
          console.log('Clearing loop')
          clearInterval(main)
        }
        tray.kill()
        createSysTrayMenu()
      }
    })

    let temperatureParentMenuItem = tray.item('Color temperature')
    temperatureParentMenuItem.add(
      tray.item('2700K', () => tryLightCommand(setTemperatureInKelvin, 2700))
    )
    temperatureParentMenuItem.add(
      tray.item('3000K', () => tryLightCommand(setTemperatureInKelvin, 3000))
    )
    temperatureParentMenuItem.add(
      tray.item('3300K', () => tryLightCommand(setTemperatureInKelvin, 3300))
    )
    temperatureParentMenuItem.add(
      tray.item('3600K', () => tryLightCommand(setTemperatureInKelvin, 3600))
    )
    temperatureParentMenuItem.add(
      tray.item('4000K', () => tryLightCommand(setTemperatureInKelvin, 4000))
    )
    temperatureParentMenuItem.add(
      tray.item('5000K', () => tryLightCommand(setTemperatureInKelvin, 5000))
    )
    temperatureParentMenuItem.add(
      tray.item('6500K', () => tryLightCommand(setTemperatureInKelvin, 6500))
    )

    let brightnessPercentMenuItem = tray.item('Brightness')
    brightnessPercentMenuItem.add(
      tray.item('20%', () => tryLightCommand(setBrightnessPercentage, 20))
    )
    brightnessPercentMenuItem.add(
      tray.item('30%', () => tryLightCommand(setBrightnessPercentage, 30))
    )
    brightnessPercentMenuItem.add(
      tray.item('40%', () => tryLightCommand(setBrightnessPercentage, 40))
    )
    brightnessPercentMenuItem.add(
      tray.item('50%', () => tryLightCommand(setBrightnessPercentage, 50))
    )
    brightnessPercentMenuItem.add(
      tray.item('60%', () => tryLightCommand(setBrightnessPercentage, 60))
    )
    brightnessPercentMenuItem.add(
      tray.item('70%', () => tryLightCommand(setBrightnessPercentage, 70))
    )
    brightnessPercentMenuItem.add(
      tray.item('80%', () => tryLightCommand(setBrightnessPercentage, 80))
    )
    brightnessPercentMenuItem.add(
      tray.item('90%', () => tryLightCommand(setBrightnessPercentage, 90))
    )
    brightnessPercentMenuItem.add(
      tray.item('100%', () => tryLightCommand(setBrightnessPercentage, 100))
    )

    let toggleMenuItem = tray.item('Toggle light', () =>
      tryLightCommand(toggle)
    )

    let separatorMenuItem = tray.separator()

    let exitMenuItem = tray.item('Exit', () => process.exit())

    tray.setMenu(
      toggleMenuItem,
      separatorMenuItem,
      temperatureParentMenuItem,
      brightnessPercentMenuItem,
      separatorMenuItem,
      cameraDetectionMenuItem,
      separatorMenuItem,
      exitMenuItem
    )
  })
}

function createMainLoop () {
  return setInterval(() => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing registry query: ${error.message}`)
        return
      }

      // Split the output by lines
      const lines = stdout.split('\n')

      // Check each line for the value
      let inUse = false

      for (const line of lines) {
        if (line.includes('LastUsedTimeStop')) {
          const split = line.split('    ')
          const value = split[3].trim()
          if (value == '0x0') {
            inUse = true
            break
          }
        }
      }

      // Print the result
      if (inUse != lastInUse) {
        if (inUse) {
          // Initialize Litra device
          console.log('⏺️ Camera is in use.')
          if (tryLightCommand(turnOn)) console.log('Turning on Lytra...')
        } else {
          console.log('❌ Camera is not in use.')
          tryLightCommand(turnOff)
        }
      }

      lastInUse = inUse
    })
  }, 1500)
}

let main = createMainLoop()

// Registry path to check
const registryPath =
  'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam'

// Command to query registry value
const command = `reg query "${registryPath}" /s /v LastUsedTimeStop`

var lastInUse = null

function tryLightCommand (func, parameter) {
  const device = findDevice()
  if (device) {
    func(device, parameter)
    return true
  } else {
    console.warn("Can't find Lytra.")
    return false
  }
}