import { findUpstreams } from "@/db";

/**
 * find a suitable upstream for the model
 * @param model model name, or model name with upstream name separated by colon (e.g. deekseek-r1 or deekseek-r1:deekseek)
 * @returns Upstream object, or undefined if not found
 */
export async function selectUpstream(model: string) {
  const m = model.match(/^(\S+):(\S+)$/);
  if (m === null) {
    const availables = await findUpstreams(model);
    if (availables.length === 0) {
      return undefined;
    }
    // TODO: implement load balancing
    return availables[0];
  }
  const availables = await findUpstreams(m[1], m[2]);
  if (availables.length === 0) {
    return undefined;
  }
  return availables[0];
}
