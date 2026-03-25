import Config

config :realtime,
  ecto_repos: [Realtime.Repo]

config :realtime, RealtimeWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: RealtimeWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Realtime.PubSub,
  live_view: [signing_salt: "realtime_lv"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
