const clipboardy = require('clipboardy');
const admin = require('firebase-admin');
const cypressFirebasePlugin = require('cypress-firebase').plugin; // eslint-disable-line
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  const extendedConfig = cypressFirebasePlugin(on, config, admin);
  on('task', {
    getClipboard: () => (
      clipboardy.readSync()
    ),
  });
  return extendedConfig;
};
