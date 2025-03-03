import { readFileSync } from "node:fs";
import { UPSTREAMS_FILE } from "./config";

export type Upstream = {
  supportedModels: string[]; // list of models supported by this upstream
  name: string; // unique name of the upstream
  apiKey?: string; // api key to upstream, omitted if not required
  endPoint: string; // endpoint of the upstream
  weight?: number; // optional, for load balancing
};

/**
 * find a suitable upstream for the model
 * @param upstreams array of upstreams
 * @param model model name, or model name with upstream name separated by colon (e.g. deekseek-r1 or deekseek-r1:deekseek)
 * @returns Upstream object, or undefined if not found
 */
export function selectUpstream(upstreams: Upstream[], model: string) {
  const m = model.match(/^(\S+):(\S+)$/);
  if (m === null) {
    const availables = upstreams.filter((u) => u.supportedModels.includes(model));
    if (availables.length === 0) {
      return undefined;
    }
    // TODO: implement load balancing
    return availables[0];
  }
  return upstreams.find((u) => u.name === m[1] && u.supportedModels.includes(m[0]));
}

export const upstreams: Upstream[] = JSON.parse(readFileSync(UPSTREAMS_FILE || "upstreams.json", "utf-8"));
