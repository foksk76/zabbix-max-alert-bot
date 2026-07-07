#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

echo "== Zabbix MAX Alert Bot repository check =="

required_files=(
  "README.md"
  "AGENTS.md"
  ".agents/project-context.md"
  "DEVELOPMENT.md"
  "docs/README.md"
  "docs/project-context.md"
  "docs/documentation-policy.md"
  "docs/decisions/README.md"
  "docs/decisions/ADR-0001-ai-assisted-dev.md"
  "docs/decisions/ADR-0002-use-external-agent-skills.md"
  "docs/zabbix-media-type.md"
  "src/zabbix-media-type/max-webhook.js"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    fail "required file is missing: $file"
  fi
done

echo "Required files: OK"

if grep -RInE "Отдел|SOC|NOC" README.md docs .agents 2>/dev/null; then
  fail "found organization-specific wording in docs or agent context"
fi

echo "Audience wording: OK"

if find .agents/adr -type f ! -name 'README.md' 2>/dev/null | grep -q .; then
  fail "ADR files must be stored in docs/decisions, not .agents/adr"
fi

echo "ADR location: OK"

echo "Repository check completed"
