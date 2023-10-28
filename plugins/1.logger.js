// 打印日志
export default defineNitroPlugin(async (nitroApp) => {
  const rtf = new Intl.DateTimeFormat("zh-cn", {
    dateStyle: "short",
    timeStyle: "short",
  });
  nitroApp.hooks.hook("request", (event) => {
    const now = Date.now();
    event.context.startTime = now;
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
    const record = `${rtf.format(now)} -> ${event.path} ${ip}`;
    console.log(record);
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    const now = Date.now();
    const time = now - event.context.startTime;
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? "";
    const record = `${rtf.format(now)} <- ${event.path} ${ip} ${time}ms`;
    console.log(record);
  });
});
