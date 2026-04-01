#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

REPO_DIR="/home/merry.earth/_repos/shopping-helper"
LOG="$HOME/logs/deploy-shopping-helper.log"

echo "$(date) - Deploy started" >> "$LOG"

cd "$REPO_DIR"
git pull origin main >> "$LOG" 2>&1

corepack enable
pnpm install --frozen-lockfile >> "$LOG" 2>&1
npx prisma generate >> "$LOG" 2>&1
npx prisma migrate deploy >> "$LOG" 2>&1
pnpm build >> "$LOG" 2>&1

pm2 restart shopping-helper >> "$LOG" 2>&1

echo "$(date) - Deploy complete" >> "$LOG"
