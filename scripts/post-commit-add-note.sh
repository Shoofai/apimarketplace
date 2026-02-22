#!/bin/sh
# Post-commit hook: prompt to add a git note (ref=implemented) for the commit just made.
# Install: cp scripts/post-commit-add-note.sh .git/hooks/post-commit && chmod +x .git/hooks/post-commit
# Uninstall: rm .git/hooks/post-commit

echo ""
echo "Add changelog note for this commit? (refs/notes/implemented)"
echo "  Leave empty to skip. Example: 2026-02-21: Short summary. Plan: plan_id."
printf "Note: "
read -r note

if [ -n "$note" ]; then
  git notes --ref=implemented add -f -m "$note" HEAD && echo "Note added."
fi
