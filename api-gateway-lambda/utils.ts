import { createHash } from "crypto";
import { readFileSync } from "fs";

export const hashPath = (path: string) : string => {
    const data = readFileSync(path, "utf-8");
    return createHash("sha3-256").update(data).digest("hex");
  }