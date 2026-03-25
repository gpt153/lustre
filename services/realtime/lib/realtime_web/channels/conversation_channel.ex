defmodule RealtimeWeb.ConversationChannel do
  use Phoenix.Channel

  require Logger

  @impl true
  def join("conversation:" <> conv_id, _params, socket) do
    user_id = socket.assigns.current_user_id

    case participant?(conv_id, user_id) do
      true ->
        {:ok, assign(socket, :conversation_id, conv_id)}

      false ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  # Client pushes a new message; broadcast it to all channel subscribers.
  @impl true
  def handle_in("new_message", payload, socket) do
    conv_id = socket.assigns.conversation_id
    user_id = socket.assigns.current_user_id

    broadcast!(socket, "new_message", Map.merge(payload, %{
      "conversation_id" => conv_id,
      "sender_id" => user_id,
      "sent_at" => DateTime.utc_now() |> DateTime.to_iso8601()
    }))

    {:noreply, socket}
  end

  # ---------------------------------------------------------------------------
  # Private helpers
  # ---------------------------------------------------------------------------

  defp participant?(conversation_id, user_id) do
    sql = """
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = $1
      AND user_id = $2
    LIMIT 1
    """

    case Ecto.Adapters.SQL.query(Realtime.Repo, sql, [conversation_id, user_id]) do
      {:ok, %{num_rows: 1}} ->
        true

      {:ok, %{num_rows: 0}} ->
        false

      {:error, reason} ->
        Logger.error("DB error checking conversation participant: #{inspect(reason)}")
        false
    end
  end
end
