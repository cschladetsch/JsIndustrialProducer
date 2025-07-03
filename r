#!/bin/bash
# Launch Industrial MIDI Creator

# Detect OS and use appropriate command
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open index.html
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open index.html
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start index.html
else
    echo "Unsupported OS. Please open index.html manually in your browser."
fi