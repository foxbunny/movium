module.exports = {
  presets: [
    ['@babel/env'],
  ],
  plugins: [
    '@babel/plugin-proposal-throw-expressions',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
  ],
}
