// craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [],
    },
    less: {
      loaderOptions: {
        lessOptions: {
          modifyVars: {
            // Ant Design theme variables here
            'primary-color': '#1DA57A',
            'link-color': '#1DA57A',
            // Add any other variables you need to override
          },
          javascriptEnabled: true,
        },
      },
    },
  },
};

