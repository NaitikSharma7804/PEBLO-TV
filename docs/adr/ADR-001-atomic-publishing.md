# ADR 001: Atomic File Replacement for Static Catalogue

## Status
Accepted

## Context
High concurrency during streaming hours can lead to read-during-write corruption if files are updated in place.

## Decision
Compile catalogue payload into a temporary file on the same filesystem volume, then invoke `os.replace()` for an atomic rename.

## Consequences
Zero chance of partial payload exposure; requires identical filesystem volume for atomic rename guarantee.
