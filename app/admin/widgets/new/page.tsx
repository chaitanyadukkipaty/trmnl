import { serverPlugins } from "@/widgets/server-plugins";
import { WidgetForm } from "../WidgetForm";

export default function NewWidgetPage() {
  // Strip server-only `fetcher` function — can't be passed to Client Components
  const plugins = serverPlugins.map(({ fetcher, ...meta }) => ({
    ...meta,
    hasFetcher: !!fetcher,
  }));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">New Widget</h1>
      <p className="text-gray-500 text-sm mb-8">Choose a plugin and configure it</p>
      <WidgetForm plugins={plugins} />
    </div>
  );
}
