defmodule RealtimeWeb.UserChannel do
  use Phoenix.Channel

  require Logger

  @impl true
  def join("user:" <> user_id, _params, socket) do
    if user_id == socket.assigns.current_user_id do
      # Track user presence on join
      Realtime.Presence.track(socket, user_id, %{
        online_at: DateTime.utc_now() |> DateTime.to_iso8601()
      })

      # Send presence_diff to the user's channel
      send(self(), :after_join)

      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    push(socket, "presence_diff", Realtime.Presence.list(socket))
    {:noreply, socket}
  end

  # Handle push of a match notification from the server side (internal).
  @impl true
  def handle_in("ping", _payload, socket) do
    {:reply, {:ok, %{status: "pong"}}, socket}
  end

  # Presence heartbeat or generic client-to-server update.
  def handle_in(_event, _payload, socket) do
    {:noreply, socket}
  end
end
