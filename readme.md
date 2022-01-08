# netlify-plugin-password-protection

[![Netlify Status](https://api.netlify.com/api/v1/badges/27c1e498-cf03-4eb7-92e8-03e502ed1300/deploy-status)](https://app.netlify.com/sites/password-protection-plugin/deploys)

Soon to be added to the plugins directory https://github.com/netlify/plugins/pull/110

Based on the fantastic CLI tool [staticrypt](https://github.com/robinmoisson/staticrypt), this plugin will encrypt your files with a password from your NETLIFY environment variables

## Setup

### Install the plugin as a dependency to your repository

```sh
npm i --s netlify-plugin-password-protection
```

### Add the plugin in `netlify.toml`

```toml
[[plugins]]
  package = "netlify-plugin-password-protection"
```

Deploy your Netlify Site!

### Optional Configuration in `netlify.toml`

```toml
[[plugins]]
  package = "netlify-plugin-password-protection"

  [plugins.inputs]
    fileFilter = "*.html" # default
    directoryFilter = ["!node_modules", "!admin", "!plugins"] # default
    title = "Protected Page" # default
    instructions = "" # default
```

### View the [Demo](https://password-protection-plugin.netlify.app/)

Default password is `P@SS-WORD`. Overwrite with `process.env.PROTECTED_PASSWORD`

We use [paulmillr/readdirp](https://github.com/paulmillr/readdirp#options) and pass both options `fileFilter` and `directoryFilter` directly to choose which html files will be encrypted.

[License][license] MIT

Made by [Blair Anderson](https://www.blandersoft.com/)
