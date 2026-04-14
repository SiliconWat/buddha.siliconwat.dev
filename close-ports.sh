#!/bin/bash

# chmod +x close-ports.sh

# Define the ports to close
PORTS=(4003 9093 5003 5004 8083 9193)

for PORT in "${PORTS[@]}"; do
  echo "Checking port $PORT..."
  PID=$(lsof -ti tcp:$PORT)

  if [ -n "$PID" ]; then
    echo "Port $PORT is being used by PID $PID. Killing..."
    kill -9 $PID
    echo "Killed process using port $PORT"
  else
    echo "Port $PORT is not in use."
  fi
done
