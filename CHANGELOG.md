# Changelog

### 0.6.1
- fix: upgrade unleash-client to v3.11.2
### 0.6.0
- feat: propagate impression data field (#48)
- fix: remove npm folder in docker image after build
- fix: export Client and createProxyConfig (#52)
- fix: Create codeql-analysis.yml
- docs: Fix description of `proxy_base_path` to match implementation (#51)
- docs: fix env variable names so the docs match the implementation. (#43)

### 0.5.0
- feat: additional possibility to customize header for proxy secrets (#39)
- fix: POST should handle empty toggle names
- fix: pin dependencies
- fix: Build multi-arch Docker container to support arm64 and amd64 (#30)
- docs: fix typo in `docker pull` command (#26)
- docs: Add proxyPort/PORT to the list of options/env vars (#28)

### 0.4.0
- feat: add compression #23

### 0.3.2
- fix: perform build before publish!

### 0.3.1

- fix: config.unleashAppName should default to unleashAppName

### 0.3.0

- feat: Add support for namePrefix and tag filtering (#21)
- fix: add maxAge to /proxy endpoint

### 0.2.0

- feat: improve info logger
- fix: do not call "start()" in exported main.
- feat: add unleash instance id option (#19)
- feat: add support for reverse proxies (#17)
- fix: update package-lock-json
- build(deps): bump tar from 6.1.0 to 6.1.5 (#15)
- chore: Added workflows on tags


### 0.1.1
- fix: Update unleash-client to 3.9.1
- fix: require app instead of index.
- fix: Update README.md
