#!/usr/bin/env sh

set -e

if [ -n "$UNLEASH_CUSTOM_STRATEGIES_FILE" ]; then
	echo "Loading custom strategies from file $UNLEASH_CUSTOM_STRATEGIES_FILE"
	mkdir -p ./dist/strategies
	cp "$UNLEASH_CUSTOM_STRATEGIES_FILE" ./dist/strategies
	UNLEASH_CUSTOM_STRATEGIES_FILE="./strategies/$(basename "$UNLEASH_CUSTOM_STRATEGIES_FILE")"
	export UNLEASH_CUSTOM_STRATEGIES_FILE
fi

if [ -n "$EXP_CUSTOM_ENRICHERS_FILE" ]; then
	echo "Loading custom enrichers from file $EXP_CUSTOM_ENRICHERS_FILE"
	mkdir -p ./dist/enrichers
	cp "$EXP_CUSTOM_ENRICHERS_FILE" ./dist/enrichers
	EXP_CUSTOM_ENRICHERS_FILE="./enrichers/$(basename "$EXP_CUSTOM_ENRICHERS_FILE")"
	export EXP_CUSTOM_ENRICHERS_FILE
fi

node dist/start
