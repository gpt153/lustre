defmodule Realtime.NatsClient do
  @moduledoc """
  NATS client for publishing messages to the event bus.
  Manages connection to NATS and provides publish/2 for sending events.
  """

  require Logger

  @doc """
  Publishes a JSON-encoded payload to a NATS subject.

  Returns {:ok, :published} on success, or {:error, reason} on failure.
  """
  def publish(subject, payload) when is_binary(subject) and is_map(payload) do
    with {:ok, conn} <- get_connection() do
      body = Jason.encode!(payload)
      Gnat.pub(conn, subject, body)
      {:ok, :published}
    else
      error -> error
    end
  end

  defp get_connection do
    case Application.get_env(:realtime, :nats_conn) do
      nil ->
        {:error, :nats_not_available}

      pid ->
        case Process.alive?(pid) do
          true -> {:ok, pid}
          false -> {:error, :nats_connection_dead}
        end
    end
  end
end
