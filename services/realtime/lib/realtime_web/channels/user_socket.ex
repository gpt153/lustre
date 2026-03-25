defmodule RealtimeWeb.UserSocket do
  use Phoenix.Socket

  channel "conversation:*", RealtimeWeb.ConversationChannel
  channel "user:*", RealtimeWeb.UserChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case verify_token(token) do
      {:ok, user_id} ->
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"

  # ---------------------------------------------------------------------------
  # Private helpers
  # ---------------------------------------------------------------------------

  defp verify_token(token) do
    jwt_secret = System.get_env("PHX_JWT_SECRET") || raise "PHX_JWT_SECRET not set"

    signer = Joken.Signer.create("HS256", jwt_secret)

    # verify/2 checks signature; we then validate claims manually so that
    # expiry and token-type are both enforced without requiring a Joken config module.
    case Joken.verify(token, signer) do
      {:ok, claims} ->
        with :ok <- check_expiry(claims),
             {:ok, user_id} <- validate_claims(claims) do
          {:ok, user_id}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Enforce exp claim: reject tokens that have expired or have no exp.
  defp check_expiry(%{"exp" => exp}) when is_integer(exp) do
    now = System.system_time(:second)

    if exp > now do
      :ok
    else
      {:error, :token_expired}
    end
  end

  defp check_expiry(_claims), do: {:error, :missing_exp}

  defp validate_claims(%{"sub" => sub, "type" => "access"}) when is_binary(sub) and sub != "" do
    {:ok, sub}
  end

  defp validate_claims(%{"type" => type}) when type != "access" do
    {:error, :invalid_token_type}
  end

  defp validate_claims(_claims) do
    {:error, :invalid_claims}
  end
end
