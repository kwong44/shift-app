// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve issues with Supabase realtime-js and Expo SDK 53+
// See: https://github.com/supabase/supabase-js/issues/1258
// and: https://github.com/supabase/supabase-js/issues/1400
// Metro's support for Node‑style conditional exports now strictly honors the configured "conditions".
// We need to explicitly add 'browser' to the condition list for ws (dependency of supabase-js).
// Setting unstable_enablePackageExports to false is also recommended.
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 