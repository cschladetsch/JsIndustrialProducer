#!/bin/bash
# Launch Industrial MIDI Creator

# Detect OS and use appropriate command
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open IndustrialMIDICreator.html
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open IndustrialMIDICreator.html
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start IndustrialMIDICreator.html
else
    echo "Unsupported OS. Please open IndustrialMIDICreator.html manually in your browser."
fi