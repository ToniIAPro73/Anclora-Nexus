Implement seller-memory-semantic-recall v1.1 following SDD.

- Keep `seller_interactions` as source of truth.
- Add real embeddings persistence to `seller_memory_records`.
- Use PII-redacted content before vectorization.
- Prefer hybrid retrieval: vector similarity + explainable lexical signals.
- Degrade to lexical retrieval if embeddings provider is unavailable.
- Surface retrieval mode and vector readiness in the seller workbench.
- Reuse memory retrieval inside dossier/outreach generation.
