import Config

config :realtime, Realtime.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "lustre_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

config :realtime, RealtimeWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4001],
  check_origin: false,
  code_reloader: false,
  debug_errors: true,
  secret_key_base: "dev_secret_key_base_change_in_prod_this_is_64_bytes_long_padding_xx",
  watchers: []

config :logger, level: :debug
