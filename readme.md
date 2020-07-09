# netlify-plugin-password-protection

Based on the fantastic CLI tool [staticrypt](https://github.com/robinmoisson/staticrypt), this plugin will encrypt your files with a password from your NETLIFY environment variables

## Setup

### Install the plugin as a dependency to your repository

```sh
npm i --s netlify-plugin-password-protection
```

### Configure the plugin in `netlify.toml` (these are default values)

```toml
[[plugins]]
  package = "netlify-plugin-password-protection"

  [plugins.inputs]
    fileFilter = "*.html"
    directoryFilter = ["!node_modules", "!admin", "!plugins"]
    title = "Protected Page"
    instructions = ""
```

Made by [Blair Anderson](https://www.andersonassociates.net)
