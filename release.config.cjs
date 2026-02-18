module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        presetConfig: {
          types: [
            { type: 'feat', section: ':sparkles: Features', hidden: false },
            { type: 'feature', section: ':sparkles: Features', hidden: false },
            { type: 'fix', section: ':bug: Fixes', hidden: false },
            { type: 'style', section: ':barber: Style', hidden: false },
            { type: 'perf', section: ':fast_forward: Performance Improvements', hidden: false },
            { type: 'docs', section: ':memo: Documentation', hidden: true },
            { type: 'refactor', section: ':zap: Refactoring', hidden: true },
            { type: 'revert', section: ':zap: Reverts', hidden: true },
            { type: 'test', section: ':white_check_mark: Tests', hidden: true },
            { type: 'ci', section: ':repeat: CI', hidden: true },
            { type: 'chore', section: ':repeat: Chores', hidden: true },
            { type: 'build', section: ':repeat: Build System', hidden: true },
          ],
        },
      },
    ],
    ['@semantic-release/changelog'],
    "@semantic-release/npm",
    ['@semantic-release/github'],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
      },
    ],
  ],

  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'master',
    { name: 'pre', prerelease: 'rc' },
    { name: 'next', prerelease: 'next' },
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ]
};
