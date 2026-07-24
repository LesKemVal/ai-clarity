# GEORGE Dead Code Ledger

## Purpose

Track code that is unreferenced, superseded, duplicated, partially integrated, or retained temporarily during production work.

This ledger prevents unfinished contracts and transitional files from silently becoming permanent dead code.

## Rules

- Inspect references before adding a new owner or contract.
- Record newly introduced but unconsumed code immediately.
- Distinguish pending integration from confirmed dead code.
- Do not keep compatibility code without an identified consumer and removal condition.
- Remove superseded code after the replacement path is validated.
- Update this ledger in the same commit that wires, supersedes, or removes a tracked item.

## Open Items

### `lib/george/runtime/provider-semantic-intent.ts`

Status: **Pending integration — currently unreferenced**

Introduced in commit:

```text
951e77b Add shared provider semantic intent contract
```

Intended canonical use:

- provider realization returns user-facing output and semantic capability intent from the same reasoning pass;
- shared runtime consumes explicit capability requests and inferred opportunities;
- execution policy determines mode-specific realization downstream.

Must not become:

- a second provider call;
- a LIVE-specific language parser;
- a duplicate intent owner;
- a keyword or phrase classifier;
- a separate Normal or LIVE reasoning lane.

Resolution condition:

- wire the contract into the canonical provider result and runtime pipeline with qualification coverage; or
- delete the file if the provider contract is implemented through another existing canonical owner.

## Confirmed Dead Code

None recorded.
