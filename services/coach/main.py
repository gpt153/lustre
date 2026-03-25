import os
from dotenv import load_dotenv

load_dotenv()

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, elevenlabs, silero

from personas import PERSONAS

LIVEKIT_URL = os.environ["LIVEKIT_URL"]
LIVEKIT_API_KEY = os.environ["LIVEKIT_API_KEY"]
LIVEKIT_API_SECRET = os.environ["LIVEKIT_API_SECRET"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
ELEVENLABS_API_KEY = os.environ["ELEVENLABS_API_KEY"]


class CoachAgent(Agent):
    def __init__(self, system_prompt: str) -> None:
        super().__init__(instructions=system_prompt)


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()

    # Resolve persona from room metadata; default to "coach"
    room_metadata = ctx.room.metadata or ""
    coach_type = "coach"
    if room_metadata:
        import json
        try:
            metadata = json.loads(room_metadata)
            coach_type = metadata.get("coach_type", "coach")
        except (json.JSONDecodeError, AttributeError):
            coach_type = "coach"

    persona = PERSONAS.get(coach_type, PERSONAS["coach"])
    system_prompt: str = persona["system_prompt"]
    voice_id: str = persona["voice_id"]

    vad = ctx.proc.userdata.get("vad") or silero.VAD.load()

    session = AgentSession(
        stt=openai.STT(model="whisper-1"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=elevenlabs.TTS(voice_id=voice_id),
        vad=vad,
    )

    agent = CoachAgent(system_prompt=system_prompt)
    await session.start(ctx.room, agent=agent)


def prewarm(proc) -> None:
    proc.userdata["vad"] = silero.VAD.load()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
