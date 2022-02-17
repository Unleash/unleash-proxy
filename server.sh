#!/usr/bin/env sh

set -e

if [ ! -z "$UNLEASH_CUSTOM_STRATEGIES_FILE" ]; then
	echo "Loading custom strategies from file $UNLEASH_CUSTOM_STRATEGIES_FILE"
	mkdir -p ./dist/strategies
	cp $UNLEASH_CUSTOM_STRATEGIES_FILE ./dist/strategies
	export UNLEASH_CUSTOM_STRATEGIES_FILE="./strategies/$(basename $UNLEASH_CUSTOM_STRATEGIES_FILE)"
fi

node dist/start
