const readdirp = require("readdirp");
var CryptoJS = require("crypto-js");
var FileSystem = require("fs");
const path = require("path");

const SCRIPT_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js";
const SCRIPT_TAG =
  '<script src="' +
  SCRIPT_URL +
  '" integrity="sha384-lp4k1VRKPU9eBnPePjnJ9M2RF3i7PC30gXs70+elCVfgwLwx1tv5+ctxdtwxqZa7" crossorigin="anonymous"></script>';

const { PROTECTED_PASSWORD } = process.env;
const FALLBACK_PASSWORD = "P@SS-WORD";
const FALLBACK_INSTRUCTIONS =
  "Password is '" +
  FALLBACK_PASSWORD +
  "'<br><small>(Requires environtment variable PROTECTED_PASSWORD)</small>";

module.exports = {
  onPostBuild: async ({ inputs, constants, utils }) => {
    const { IS_LOCAL } = constants;
    let password = PROTECTED_PASSWORD;
    let instructions = inputs.instructions || "";

    if (password === null || password === undefined) {
      password = FALLBACK_PASSWORD;
      instructions =
        FALLBACK_INSTRUCTIONS +
        '<br> <a target="_blank" href="https://app.netlify.com/sites/">Edit your Deploy Settings<a/>';
    }

    const htmlFiles = await getHtmlFiles(constants.PUBLISH_DIR, inputs);

    try {
      console.log(
        "START Password Encryption:\n" + JSON.stringify(htmlFiles, null, 4)
      );

      for (const filePath of htmlFiles) {
        const contents = FileSystem.readFileSync(filePath, "utf8");
        const encrypted = encrypt(contents, password);
        const hmac = CryptoJS.HmacSHA256(
          encrypted,
          CryptoJS.SHA256(password).toString()
        ).toString();
        const encryptedMessage = hmac + encrypted;

        if (IS_LOCAL) {
          console.log("encryped: " + encryptedMessage);
          console.log("\n\n");
          console.log("start genFile:" + filePath + "\n");
        }

        genFile(
          {
            title: inputs.title || "Protected Page",
            instructions: instructions,
            encrypted: encryptedMessage,
            crypto_tag: SCRIPT_TAG,
            file: path.join(__dirname, "password_template.html"),
            outputFilePath: filePath
          },
          utils
        );

        if (IS_LOCAL) {
          console.log("end genFile:" + filePath + "\n");
        }
      }

      console.log("COMPLETE Password Encryption");
    } catch (error) {
      return utils.build.failBuild("Failed to password protect.", { error });
    }
  }
};

const getHtmlFiles = async (directory, { fileFilter, directoryFilter }) => {
  const files = await readdirp.promise(directory, {
    fileFilter: fileFilter || "*.html",
    directoryFilter: directoryFilter || ["!node_modules", "!admin", "!plugins"]
  });

  return files.map(file => file.fullPath);
};

/**
 * Fill the template with provided data and writes it to output file.
 *
 * @param data
 */
function genFile(data, utils) {
  const { file, outputFilePath } = data;
  try {
    var templateContents = FileSystem.readFileSync(file, "utf8");
    var renderedTemplate = render(templateContents, data);
    FileSystem.writeFileSync(outputFilePath, renderedTemplate);
  } catch (e) {
    return utils.build.failBuild("Failed rendering encrypted template", {
      error: e
    });
  }
}

/**
 * Replace the placeholder tags (between '{tag}') in 'tpl' string with provided data.
 *
 * @param tpl
 * @param data
 * @returns string
 */
function render(tpl, data) {
  return tpl.replace(/{(.*?)}/g, function(_, key) {
    return (data && data[key]) || "";
  });
}

function encrypt(msg, password) {
  const keySize = 256;
  const iterations = 1000;
  const salt = CryptoJS.lib.WordArray.random(128 / 8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: keySize / 32,
    iterations: iterations
  });

  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  var encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  var encryptedMsg = salt.toString() + iv.toString() + encrypted.toString();
  return encryptedMsg;
}
