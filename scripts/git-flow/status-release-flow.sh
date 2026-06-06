#!/usr/bin/env bash
set -euo pipefail

echo "== Current branch =="
git branch --show-current

echo
echo "== Working tree =="
git status --short

echo
echo "== Local branches =="
git branch

echo
echo "== Remote branches =="
git branch -r

echo
echo "== Commits in development not in staging =="
git log --oneline staging..development || true

echo
echo "== Commits in staging not in production =="
git log --oneline production..staging || true

echo
echo "== Recent tags =="
git tag --sort=-creatordate | head -n 10 || true