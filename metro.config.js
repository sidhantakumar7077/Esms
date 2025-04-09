const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    // transformer: {
    //     babelTransformerPath: require.resolve('react-native-svg-transformer'),
    // },
    // resolver: {
    //     assetExts: [],
    //     sourceExts: [],
    // },
};

// const defaultConfig = getDefaultConfig(__dirname);
// defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
// defaultConfig.resolver.sourceExts.push('svg');
// module.exports = mergeConfig(defaultConfig, config);

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
