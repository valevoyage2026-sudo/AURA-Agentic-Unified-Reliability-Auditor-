# SECURITY_RULES.md — Security, Data Protection & Coding Rules

This document defines the non-negotiable security standards, data privacy guidelines, and coding safety rules for all contributors and agents working on the AURA platform.

---

## 1. No Hardcoding Policy

### 🔒 Rule 1.1: Zero Hardcoded Credentials or API Keys
- **NEVER** embed API keys, access tokens, database passwords, secret keys, or bearer tokens directly in code, scripts, test files, or configuration files.
- All secrets must be loaded dynamically from environment variables using `pydantic-settings` in `app/core/config.py` or `.env` files.
- **Violation Severity:** Critical. Immediate PR rejection and key revocation required if committed.

```python
# BAD
api_key = "sk-proj-12345abcdef..."
db_url = "postgresql://admin:password123@localhost:5432/aura"

# GOOD
from app.core.config import settings
api_key = settings.OPENAI_API_KEY
db_url = settings.POSTGRES_URI
```

### 🔒 Rule 1.2: Environment-Dependent Configuration & URIs
- Do not hardcode internal infrastructure hostnames, ports, model version strings, or storage paths.
- Default values in code must represent safe local dev defaults (`localhost`), with production overrides supplied via environment variables.

---

## 2. Protection of Sensitive Data & Privacy

### 🛡️ Rule 2.1: Audit Log Sanitization & PII Redaction
- Never write raw user PII (Personally Identifiable Information), passwords, credit card numbers, or unredacted confidential payload data to application logs or stdout.
- Structured audit logs in PostgreSQL must record metadata, `trace_id`, `claim_id`, source IDs, and verdict rationales — not full unredacted raw source documents or sensitive user tokens.

```python
# BAD
logger.info(f"User {user_email} submitted document: {raw_sensitive_document}")

# GOOD
logger.info("document_submitted", extra={"trace_id": trace_id, "document_id": doc_id})
```

### 🛡️ Rule 2.2: Sanitized Error Messages
- API endpoints must return generic, user-safe error messages to external callers.
- Do not expose raw database stack traces, file system paths, or internal connection strings in HTTP response bodies.

---

## 3. Code Security & Agent Guardrails

### ⚡ Rule 3.1: No Dynamic Code Execution (`eval`/`exec`)
- Never use `eval()`, `exec()`, or regex scrapping to parse raw LLM text outputs into executable logic or Python dicts.
- All LLM structured outputs must pass through Pydantic model validation (`ValidationError` handling) with structured function-calling schemas.

### ⚡ Rule 3.2: SQL & Query Parameterization
- All PostgreSQL database queries must use SQLAlchemy ORM or parameterized queries with `psycopg3`.
- Direct string formatting/concatenation in SQL statements is strictly prohibited.

```python
# BAD
query = f"SELECT * FROM audit_traces WHERE trace_id = '{user_input}'"

# GOOD
query = select(AuditTrace).where(AuditTrace.trace_id == user_input)
```

### ⚡ Rule 3.3: LLM Prompt Injection & Output Containment
- Treat all external user prompts and indexed web content as untrusted input.
- System prompts must explicitly demarcate user inputs and evidence spans using clear boundaries.
- Verification agents must operate under strict evidence-bound constraints — internal parametric model knowledge must not override retrieved evidence.

---

## 4. Secret Hygiene & Git Safety

### 🔑 Rule 4.1: `.gitignore` Enforcement
- Ensure `.env`, `.env.local`, `*.pem`, `*.key`, `*.pyc`, `__pycache__/`, virtual environment directories (`env_aura/`, `venv/`), and local database dumps are listed in `.gitignore` and never tracked.

### 🔑 Rule 4.2: Pre-Commit Secret Scanning
- Developers and automated pipeline tools must run secret scanning (e.g., `ruff`, `detect-secrets`, or git pre-commit hooks) prior to pushing branches to remote repositories.

---

## 5. Compliance Verification Checklist

Before opening a PR or committing code:
- [ ] Are all API keys and credentials read from environment settings?
- [ ] Are any raw PII or secret tokens scrubbed from application logs?
- [ ] Do database queries use strict parameterization?
- [ ] Are Pydantic schemas enforcing input/output validation?
- [ ] Are `.env` files and `__pycache__` artifacts excluded from git tracking?
