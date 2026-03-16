const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 모노레포 패키지들을 Metro가 찾을 수 있도록 설정
config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// ESM 대신 CJS 빌드 우선 사용 (import.meta 문제 회피)
config.resolver.unstable_conditionNames = ['require', 'react-native', 'default'];

module.exports = config;
