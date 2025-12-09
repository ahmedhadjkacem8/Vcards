#!/usr/bin/env bash
# wait-for-it.sh

# Usage: wait-for-it.sh host:port [-t timeout]

HOST=$(echo $1 | cut -d':' -f1)
PORT=$(echo $1 | cut -d':' -f2)
TIMEOUT=${2:-30}

echo "⏳ Waiting for $HOST:$PORT ..."

for i in $(seq 1 $TIMEOUT); do
  nc -z $HOST $PORT && echo "✅ $HOST:$PORT is up" && exit 0
  sleep 1
done

echo "❌ Timeout reached: $HOST:$PORT is still not available"
exit 1
