import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { appendFile, mkdir } from "fs/promises";

async function writeLog(file, text) {
  if (!existsSync(file)) {
    await mkdir(dirname(file), {
      recursive: true,
    });
  }

  return appendFile(file, `${text}\n`, { encoding: "utf-8" });
}

// 打印日志
export default defineNitroPlugin(async (nitroApp) => {
  const timeRtf = new Intl.DateTimeFormat("zh-cn", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const dateRtf = new Intl.DateTimeFormat("zh-cn", {
    dateStyle: "short",
  });

  const { logsDir } = useAppConfig();

  nitroApp.hooks.hook("request", (event) => {
    const now = Date.now();
    event.context.startTime = now;
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
    const date = timeRtf.format(now);
    const record = `${date} --> ${event.path} ${ip}`;
    console.log(record);
    writeLog(resolve(logsDir, dateRtf.format(now)), record);
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    const now = Date.now();
    const time = now - event.context.startTime;
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
    const date = timeRtf.format(now);
    const record = `${date} <-- ${event.path} ${ip} ${time}ms`;
    console.log(record);
    writeLog(resolve(logsDir, dateRtf.format(now)), record);
  });

  nitroApp.hooks.hook("error", async (error, { event }) => {
    const now = Date.now();
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
    const date = timeRtf.format(now);
    const record = `${date} ${event.path} ${ip} ${error}`;
    console.error(record);
    writeLog(resolve(`${logsDir}/error`, dateRtf.format(now)), record);
  });
});
