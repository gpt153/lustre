defmodule RealtimeWeb.UserChannel do
  use Phoenix.Channel

  require Logger

  @impl true
  def join("user:" <> user_id, _params, socket) do
    if user_id == socket.assigns.current_user_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
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
