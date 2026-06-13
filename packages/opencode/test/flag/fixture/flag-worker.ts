import { Flag } from "../../../src/flag/flag"

process.stdout.write(
  JSON.stringify({
    authContent: Flag.MIMOCODE_AUTH_CONTENT,
    bcsCodeOnly: Flag.MIMOCODE_MIMO_ONLY,
    client: Flag.MIMOCODE_CLIENT,
    config: Flag.MIMOCODE_CONFIG,
    disableModelsFetch: Flag.MIMOCODE_DISABLE_MODELS_FETCH,
    disableShare: Flag.MIMOCODE_DISABLE_SHARE,
    home: Flag.MIMOCODE_HOME,
    modelsUrl: Flag.MIMOCODE_MODELS_URL,
    permission: Flag.MIMOCODE_PERMISSION,
    serverPassword: Flag.MIMOCODE_SERVER_PASSWORD,
  }) + "\n",
)
