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

None recorded.

## Resolved Items

### `lib/george/runtime/provider-semantic-intent.ts`

Resolution: **Removed before integration**

History:

```text
951e77b Add shared provider semantic intent contract
b268833 Remove unintegrated semantic intent contract
```

Reason:

- the file had no consumer;
- it introduced a future contract outside the active provider boundary;
- retaining it would have created silent dead code.

Replacement rule:

- extend the existing canonical provider result directly;
- wire provider output, runtime consumption, response payload, and qualification coverage in the same implementation sequence;
- do not reintroduce a standalone semantic-intent owner unless an active consumer exists in the same change.

## Confirmed Dead Code

None recorded.
