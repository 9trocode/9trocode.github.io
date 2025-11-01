---
layout: post
title: "node_storage_manager: Stop Rewriting Storage Code"
date: 2022-06-06
description: "Universal storage abstraction for Node.js - S3, GCS, Azure Blob, and local filesystem with one API. Published on npm."
tags:
- Node.js
- Open Source
- NPM
- Cloud Storage
---

I got tired of rewriting storage code every time a project changed cloud providers.

AWS S3 one month, Google Cloud Storage the next, then someone wants Cloudinary for image uploads. Each switch meant touching every file that dealt with storage. Change imports, update config, rewrite upload logic, fix tests. Again and again.

Fuck that.

## The Solution

Factory pattern. One interface, multiple providers. Change one line of code, not fifty.

```javascript
const Storage = require('node_storage_manager');

// This line is the only thing you change
let store = Storage.getInstance('AWS');
// let store = Storage.getInstance('GCLOUD');
// let store = Storage.getInstance('CLOUDINARY');

// Everything else stays the same
await store.upload(bucket, filepath, dest);
await store.download(bucket, filename, dest);
await store.delete(bucket, filename);
```

That's it. Swap providers by changing four characters.

## Implementation

The hard part was handling provider quirks:

**AWS S3**: Wants region configuration, IAM keys, bucket policies  
**Google Cloud**: JSON credentials, project IDs, different error handling  
**Cloudinary**: Needs file type (image vs video), returns transformed URLs  
**DigitalOcean Spaces**: S3-compatible but different endpoints  
**Local filesystem**: Synchronous operations in async land

I wrote adapters for each. They all implement the same interface: `upload()`, `download()`, `delete()`, `listFiles()`. Behind that interface, each adapter speaks its provider's language.

## Configuration

Use environment variables. No hardcoded credentials.

```bash
# AWS
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...

# Google Cloud
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Cloudinary
export CLOUDINARY_URL=cloudinary://key:secret@cloud

# Local
export MOUNT_POINT=/data/uploads
```

Change environments, change variables. Code doesn't change.

## Testing Was Hell

Testing multi-cloud storage means:

1. Mocking five different APIs
2. Handling provider-specific errors
3. Testing with real cloud accounts (expensive)
4. Edge cases (network failures, quota limits, permission errors)

I wrote mocks for fast tests, but also integration tests that hit real providers. The CI bill was annoying, but caught real issues.

## What I'd Do Differently

If I rewrote this today:

- TypeScript for better types
- Streaming uploads for large files
- Better error types (not just strings)
- Retry logic built-in
- Progress callbacks

But it works. It's been running in production for years. 8 stars on GitHub, still gets PRs, people actually use it.

## The Code

[github.com/9trocode/node_storage_manager](https://github.com/9trocode/node_storage_manager)

Available on npm: `npm install node_storage_manager`

MIT licensed. Do whatever you want with it.

## Real Usage

We use this at work for:

- Local dev (filesystem storage)
- Staging (DigitalOcean Spaces)
- Production (AWS S3)
- Image processing (Cloudinary)

Same codebase, different env vars. It just works.

---

Not every open source project needs thousands of stars. This one solves a real problem for a small group of people. That's enough.
