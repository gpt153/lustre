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

  @impl true
  def handle_in("send_message", payload, socket) do
    conv_id = socket.assigns.conversation_id
    user_id = socket.assigns.current_user_id

    content = Map.get(payload, "content", "")
    message_type = Map.get(payload, "type", "TEXT")
    client_msg_id = Map.get(payload, "clientMsgId")

    # Publish to NATS for persistence
    nats_payload = %{
      "conversationId" => conv_id,
      "senderId" => user_id,
      "content" => content,
      "type" => message_type,
      "clientMsgId" => client_msg_id
    }

    with {:ok, :published} <- Realtime.NatsClient.publish("chat.message.new", nats_payload) do
      # Generate a temporary ID for optimistic UI
      temp_id = Ecto.UUID.generate()
      now = DateTime.utc_now() |> DateTime.to_iso8601()

      # Broadcast optimistic message to all subscribers
      broadcast!(socket, "new_message", %{
        "id" => temp_id,
        "conversationId" => conv_id,
        "senderId" => user_id,
        "content" => content,
        "type" => message_type,
        "status" => "SENT",
        "createdAt" => now
      })

      {:reply, {:ok, %{status: "sent"}}, socket}
    else
      error ->
        Logger.error("Failed to publish message to NATS: #{inspect(error)}")
        {:reply, {:error, %{reason: "failed_to_send"}}, socket}
    end
  end

  # Legacy handler for backward compatibility
  @impl true
  def handle_in("new_message", payload, socket) do
    handle_in("send_message", payload, socket)
  end

  # Handle typing start event; broadcast to all OTHER participants.
  @impl true
  def handle_in("typing_start", _payload, socket) do
    user_id = socket.assigns.current_user_id

    broadcast_from!(socket, "user_typing", %{
      "user_id" => user_id,
      "typing" => true
    })

    {:noreply, socket}
  end

  # Handle typing stop event; broadcast to all OTHER participants.
  @impl true
  def handle_in("typing_stop", _payload, socket) do
    user_id = socket.assigns.current_user_id

    broadcast_from!(socket, "user_typing", %{
      "user_id" => user_id,
      "typing" => false
    })

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
