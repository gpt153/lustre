defmodule Realtime.NatsConnector do
  @moduledoc """
  Supervisor that manages the NATS connection lifecycle.
  Starts the connection as a named child and stores it in application config.
  """

  use GenServer

  require Logger

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    {:ok, [], {:continue, :connect}}
  end

  @impl true
  def handle_continue(:connect, state) do
    nats_url = System.get_env("NATS_URL", "nats://localhost:4222")

    case Gnat.start_link(name: :nats_conn, servers: [nats_url]) do
      {:ok, conn} ->
        Logger.info("NATS connection established to #{nats_url}")
        Application.put_env(:realtime, :nats_conn, conn)
        {:noreply, state}

      {:error, reason} ->
        Logger.error("Failed to connect to NATS: #{inspect(reason)}")
        # Retry after 5 seconds
        Process.send_after(self(), :retry_connect, 5000)
        {:noreply, state}
    end
  end

  @impl true
  def handle_info(:retry_connect, state) do
    {:noreply, state, {:continue, :connect}}
  end
end
