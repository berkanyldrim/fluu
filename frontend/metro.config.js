const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// design/tokens.json lives at the workspace root (single source of truth for
// brand colors/typography, shared across frontend and future web/admin surfaces),
// so Metro needs to watch outside the frontend package root to resolve it.
config.watchFolders = [workspaceRoot];

module.exports = config;
