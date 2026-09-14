# ADR 001: Atomic File Replacement for Static Catalogue

## Status
Accepted

## Context
High concurrency during streaming hours can lead to read-during-write corruption if files are updated in place.
