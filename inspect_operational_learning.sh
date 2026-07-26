#!/usr/bin/env bash
set -euo pipefail

echo
echo "======================================"
echo " GEORGE Operational Learning Inspection"
echo "======================================"
echo

ROOT="lib/george/operational-memory"

FILES=(
"$ROOT/persist-operational-learning.ts"
"$ROOT/operational-memory.ts"
"$ROOT/conversation-record-adapter.ts"
"$ROOT/types.ts"
"$ROOT/canonical-owners.ts"
"$ROOT/script-library.ts"
"$ROOT/script-execution-recorder.ts"
"$ROOT/formula-reassessment-engine.ts"
"$ROOT/formula-evolution-engine.ts"
"$ROOT/script-revision-engine.ts"
"$ROOT/script-decision-service.ts"
)

echo
echo "Verifying required files..."
echo

for f in "${FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "MISSING: $f"
        exit 1
    fi
    echo "OK: $f"
done

echo
echo "======================================"
echo "Ownership Inspection"
echo "======================================"
echo

grep -Rni "persistOperationalLearning" lib/george app || true
echo
grep -Rni "createOperationalMemory" lib app || true
echo
grep -Rni "adaptConversationRecordForOperationalMemory" lib app || true
echo
grep -Rni "extractOperationalFormulas" lib app || true
echo
grep -Rni "validateOperationalFormula" lib app || true
echo
grep -Rni "OperationalFormulaReassessmentEngine" lib app || true
echo
grep -Rni "OperationalFormulaEvolutionEngine" lib app || true
echo
grep -Rni "OperationalScriptRevisionEngine" lib app || true
echo
grep -Rni "OperationalScriptExecutionRecorder" lib app || true

echo
echo "======================================"
echo "Potential Duplicate Ownership"
echo "======================================"
echo

grep -Rni "reassess(" lib app || true
echo
grep -Rni "evolve(" lib app || true
echo
grep -Rni "propose(" lib app || true
echo
grep -Rni "save(" lib/george/operational-memory || true

echo
echo "======================================"
echo "Git"
echo "======================================"

git status --short
echo
git branch --show-current
echo
git log --oneline -15

echo
echo "Inspection Complete."
