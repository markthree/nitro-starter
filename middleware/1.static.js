// 生产环境下当找不到资产元数据时，扫描真实的资产作为备用
// issue: https://github.com/unjs/nitro/issues/1918
// TODO 抽离到插件或者 module (待定)
// TODO 支持流处理
// TODO 支持常见的文件格式
// TODO 缓存支持
// TODO 可能使用 h3 内置的 https://github.com/unjs/h3/blob/53703dc860f1ff6fe7ce71d543deff1cfa810b11/src/utils/static.ts#L63
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const _dirname = resolve(dirname(fileURLToPath(import.meta.url)), "../public");

const onBeforeResponse = [];

const preset = import.meta.preset;

// node (prod)
if (
  preset.startsWith("node") && !import.meta.prerender &&
  !import.meta.dev
) {
  onBeforeResponse.push(
    defineResponseMiddleware(async (event) => {
      if (!event._handled) {
        const file = resolve(
          _dirname,
          getRequestURL(event).pathname.slice(1),
        );
        if (existsSync(file)) {
          send(event, await readFile(file, "utf-8"));
        }
      }
    }),
  );
}

export default eventHandler({
  handler() {
  },
  onBeforeResponse,
});
