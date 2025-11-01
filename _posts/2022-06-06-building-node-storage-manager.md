---
date: 2022-06-06
layout: post
tags:
- Node.js
- Open Source
- Cloud Storage
---

# Building a Universal Storage Manager for Node.js

I built `node_storage_manager` to solve a problem I kept running into: switching between cloud storage providers meant rewriting code. Every time a project needed to move from AWS S3 to Google Cloud Storage, or add Cloudinary for image processing, I had to refactor the entire storage layer.

<!-- more -->

## The Problem

Most Node.js applications hardcode their storage provider. You write code specifically for AWS S3, and when requirements change, you're stuck rewriting everything. I wanted a single interface that could work with any storage provider without changing application code.

## The Solution

`node_storage_manager` is a factory pattern implementation that lets you switch between storage providers by changing one line of code. It supports:

- AWS S3
- Google Cloud Storage
- Cloudinary
- DigitalOcean Spaces
- Local filesystem (NFS)

## How It Works

The core idea is simple: define a common interface, then implement provider-specific adapters.

```javascript
const Storage = require('node_storage_manager');

// Switch providers by changing this one line
let StorageInstance = Storage.getInstance('AWS');
// let StorageInstance = Storage.getInstance('GCLOUD');
// let StorageInstance = Storage.getInstance('CLOUDINARY');

// The rest of your code stays the same
await StorageInstance.upload(bucketName, filepath, destination);
await StorageInstance.download(bucketName, filename, destination);
```

## Implementation Details

Each provider has its own quirks. AWS S3 requires region configuration, Cloudinary needs file type specification, and local filesystem operations are synchronous while cloud operations are async.

The factory pattern handles these differences internally. You configure credentials via environment variables:

```bash
# AWS
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Google Cloud
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Cloudinary
export CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Real-World Usage

At work, we use this to:

- Test locally with filesystem storage
- Run staging environments with DigitalOcean Spaces
- Use AWS S3 in production
- Process images through Cloudinary

All without changing application code.

## What I Learned

**Factory patterns are powerful.** They add a layer of abstraction that makes code more maintainable, even if it seems like overkill at first.

**Environment variables for configuration.** Keeping credentials out of code and using environment variables makes switching contexts easy.

**Testing is harder with multiple providers.** I had to write tests that work across all providers, which meant understanding each provider's edge cases.

## The Code

The project is open source on [GitHub](https://github.com/9trocode/node_storage_manager) and available on [npm](https://www.npmjs.com/package/node_storage_manager).

It has 8 stars and I still use it in projects today. Not every open source project needs to be popular to be useful.
