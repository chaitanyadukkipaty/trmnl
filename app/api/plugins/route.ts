import { NextResponse } from "next/server";
import { serverPlugins } from "@/widgets/server-plugins";

export async function GET() {
  const plugins = serverPlugins.map(({ id, name, description, icon, defaultRefreshMinutes, configFields }) => ({
    id,
    name,
    description,
    icon,
    defaultRefreshMinutes,
    configFields,
  }));
  return NextResponse.json(plugins);
}
