defmodule Realtime.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Realtime.Repo,
      {Phoenix.PubSub, name: Realtime.PubSub},
      Realtime.Presence,
      {Realtime.NatsConnector, []},
      RealtimeWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Realtime.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    RealtimeWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
