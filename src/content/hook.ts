import { hooks } from "@/lib/platforms";

for (const hook of hooks()) {
  if (hook.supports(window.location)) {
    console.log(`Installing ${hook.platformName()} hook`);
    hook.install();
    break;
  }
}
