---
title: Getting Started
path: /getting-started/
filename: index
---
# Getting Started

## Using Docker
To set up your own Docker image for a project with the structure of
- ./root
  - content
  - pallium-config

```
FROM spleenboy/pallium
COPY ["content", "/usr/src/app/"]
COPY ["pallium-config", "/usr/src/app"]
ENV PALLIUM_CONFIG "./pallium-config/"
```

## Contributing
- `git clone git@github.com:spleenboy/pallium-cms.git`
- `cd pallium-cms`
- `npm install`
- `npm start`
- `open http://localhost:4000`