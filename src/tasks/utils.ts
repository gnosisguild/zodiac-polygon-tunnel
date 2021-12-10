import fs from "fs"

const DEPLOY_OUT = "./deploy.temp.json"

export function writeDeployTempFile(update: (json: any) => any) {
  let config: any
  try {
    config = JSON.parse(fs.readFileSync(DEPLOY_OUT, "utf8"))
  } catch (e) {
    config = {}
  }

  if (!config) {
    throw new Error("Could not load the temp log file")
  }

  config = update(config)

  fs.writeFileSync(DEPLOY_OUT, JSON.stringify(config, null, 2), "utf8")
}

export function readDeployTempFile() {
  let config: any
  try {
    config = JSON.parse(fs.readFileSync(DEPLOY_OUT, "utf8"))
  } catch (e) {
    config = {}
  }

  return config
}
