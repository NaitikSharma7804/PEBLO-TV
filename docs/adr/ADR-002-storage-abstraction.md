# ADR 002: Pluggable Storage Service Abstraction

## Status
Accepted

## Context
Media storage needs to support local development environments as well as cloud object storage (Cloudflare R2 / S3).

## Decision
Define a base abstract class `StorageService` implemented by `LocalStorageService`, with future extension for `R2StorageService`.

## Consequences
Allows seamless swapping of cloud providers via dependency injection without refactoring controller routes.
