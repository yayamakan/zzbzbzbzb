const JsConfuser = require('js-confuser');
const config = require('./config.json');
const fs = require('fs');

let userNameForObfuscation = '';

const setUserName = (name) => {
  userNameForObfuscation = name;
};

const updateUsageLimit = () => {
  config.currentUsage++;
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
};

const appolofree = async (code) => {
  try {
    const obfuscatedCode = await JsConfuser.obfuscate(code, {
      target: 'node',
      calculator: true,
      globalConcealing: true,
      movedDeclarations: true,
      objectExtraction: true,
      renameVariables: true,
      renameGlobals: true,
      shuffle: true,
      variableMasking: 0.5,
      stringConcealing: true,
      stringSplitting: 0.25,
      flatten: true,
      opaquePredicates: false,
      astScrambler: true,
      renameLabels: true,
      preserveFunctionLength: true,
      stringCompression: true,
      compact: true,
      lock: { antiDebug: false },
      identifierGenerator: () => {
        const randomValue = Math.floor(Math.random() * 9000) + 1000;
        const repeatedChar = "气".repeat(1);

        return userNameForObfuscation + repeatedChar + randomValue;
      },
    });

    const header = `/*
Created Obfuscated By Apikey Appolo
Owner: t.me/Luminelll
*/`;

    const obfuscatedCodeString = typeof obfuscatedCode === 'string' ? obfuscatedCode : obfuscatedCode.code;
    return header + obfuscatedCodeString;
  } catch (error) {
    console.error('Terjadi kesalahan saat obfuscation dengan jsconfuser:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  const { appolo, name, code } = req.query;

  if (!appolo || appolo !== config.apikey) {
    return res.status(401).json({
      status: false,
      message: 'API key tidak valid',
      error: 'API key is invalid',
    });
  }

  if (config.currentUsage >= config.dailyLimit) {
    return res.status(429).json({
      status: false,
      message: 'Daily limit exceeded. Please try again tomorrow.',
    });
  }

  if (!name || !code) {
    return res.status(400).json({
      status: false,
      message: 'Name dan code diperlukan',
      error: 'Both name and code are required',
    });
  }

  setUserName(name);

  try {
    const finalCode = await appolofree(code);

    updateUsageLimit();

    return res.status(200).json({
      status: true,
      message: 'Created By appolo',
      identifier: name,
      finalcode: finalCode,
    });
  } catch (error) {
    console.error('Obfuscation failed:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Gagal melakukan obfuscation',
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
}