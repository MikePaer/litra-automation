# Litra-Automation
Simple node.js program that:
1. Checks for active webcam every 1.5 seconds (via registry trick, see appendix)
2. When camera becomes active, it activates the connected Litra Glow light (using the [litra module](https://github.com/timrogers/litra)https://github.com/timrogers/litra)). When camera becomes active, it turns off the Litra Glow.

# Installing
1. Git clone
2. `npm i`
3. `node app`
