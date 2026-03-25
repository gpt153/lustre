defmodule Realtime.Presence do
  @moduledoc """
  Phoenix Presence tracker for user online/offline status.
  Uses Phoenix.Presence under the hood to track presence across nodes.
  """

  use Phoenix.Presence,
    otp_app: :realtime,
    pubsub_server: Realtime.PubSub
end
