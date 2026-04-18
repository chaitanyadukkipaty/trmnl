import type { PluginMeta } from "./types";
import { fetchWeather } from "./weather/fetcher";
import { fetchRss } from "./rss/fetcher";

export const serverPlugins: PluginMeta[] = [
  {
    id: "clock",
    name: "Clock",
    description: "Large digital clock with date",
    icon: "🕐",
    defaultRefreshMinutes: 1440,
    configFields: [
      {
        key: "showDate",
        label: "Show Date",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "showSeconds",
        label: "Show Seconds",
        type: "boolean",
        defaultValue: false,
      },
      {
        key: "format24h",
        label: "24-Hour Format",
        type: "boolean",
        defaultValue: false,
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "text",
        placeholder: "America/New_York",
        helpText: "IANA timezone name (leave blank for local time)",
      },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    description: "Current conditions and 3-day forecast",
    icon: "⛅",
    defaultRefreshMinutes: 30,
    configFields: [
      {
        key: "apiKey",
        label: "OpenWeatherMap API Key",
        type: "password",
        required: true,
        helpText: "Free API key from openweathermap.org",
      },
      {
        key: "lat",
        label: "Latitude",
        type: "text",
        placeholder: "37.7749",
        required: true,
      },
      {
        key: "lon",
        label: "Longitude",
        type: "text",
        placeholder: "-122.4194",
        required: true,
      },
      {
        key: "units",
        label: "Units",
        type: "select",
        options: [
          { value: "metric", label: "Metric (°C)" },
          { value: "imperial", label: "Imperial (°F)" },
        ],
        defaultValue: "metric",
      },
    ],
    fetcher: fetchWeather,
  },
  {
    id: "rss",
    name: "RSS Feed",
    description: "Latest headlines from any RSS feed",
    icon: "📰",
    defaultRefreshMinutes: 15,
    configFields: [
      {
        key: "feedUrl",
        label: "Feed URL",
        type: "text",
        placeholder: "https://feeds.bbci.co.uk/news/rss.xml",
        required: true,
      },
      {
        key: "maxItems",
        label: "Max Headlines",
        type: "number",
        defaultValue: 8,
      },
      {
        key: "showSource",
        label: "Show Source Name",
        type: "boolean",
        defaultValue: true,
      },
    ],
    fetcher: fetchRss,
  },
  {
    id: "custom-html",
    name: "Custom HTML",
    description: "Display any HTML content",
    icon: "📝",
    defaultRefreshMinutes: 1440,
    configFields: [
      {
        key: "content",
        label: "HTML Content",
        type: "textarea",
        placeholder: "<h1>Hello World</h1>",
        required: true,
      },
      {
        key: "backgroundColor",
        label: "Background Color",
        type: "text",
        placeholder: "#000000",
        defaultValue: "#000000",
      },
    ],
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Display data from an external webhook push",
    icon: "🔗",
    defaultRefreshMinutes: 1440,
    configFields: [
      {
        key: "template",
        label: "Mustache Template",
        type: "textarea",
        placeholder:
          "<div style='padding:24px'><h2>{{title}}</h2><p>{{value}}</p></div>",
        helpText: "Use {{variable}} to reference fields from the webhook JSON payload",
        required: true,
      },
      {
        key: "title",
        label: "Widget Title",
        type: "text",
        placeholder: "My Webhook",
      },
    ],
  },
];
