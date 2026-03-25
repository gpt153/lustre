import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: postgres://USER:PASS@HOST/DATABASE
      """

  config :realtime, Realtime.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: false

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  _jwt_secret =
    System.get_env("PHX_JWT_SECRET") ||
      raise """
      environment variable PHX_JWT_SECRET is missing.
      This must match the JWT_SECRET used by the Fastify API service.
      """

  port = String.to_integer(System.get_env("PORT") || "4001")

  config :realtime, RealtimeWeb.Endpoint,
    http: [ip: {0, 0, 0, 0}, port: port],
    secret_key_base: secret_key_base
end
