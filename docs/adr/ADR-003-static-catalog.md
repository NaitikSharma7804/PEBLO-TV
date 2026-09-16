# ADR 003: Pre-Published Static Catalogue Architecture

## Status
Accepted

## Context
Viewer streaming clients require sub-millisecond response times under peak concurrent viewers.

## Decision
Generate a pre-published static JSON document representing the entire viewing catalogue on explicit admin publish action.
