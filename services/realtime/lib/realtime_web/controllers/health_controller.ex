defmodule RealtimeWeb.HealthController do
  use Phoenix.Controller, formats: [:json]

  def index(conn, _params) do
    db_status =
      case Ecto.Adapters.SQL.query(Realtime.Repo, "SELECT 1", []) do
        {:ok, _} -> "ok"
        {:error, _} -> "degraded"
      end

    status = if db_status == "ok", do: :ok, else: :service_unavailable

    conn
    |> put_status(status)
    |> json(%{status: db_status})
  end
end
