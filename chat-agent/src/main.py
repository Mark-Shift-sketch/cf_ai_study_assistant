from workers import DurableObject, Response, WorkerEntrypoint
from pyodide.ffi import to_js as _to_js
from js import Object
from urllib.parse import urlparse
import json


def to_js(obj):
    return _to_js(obj, dict_converter=Object.fromEntries)


class MyDurableObject(DurableObject):
    def __init__(self, ctx, env):
        super().__init__(ctx, env)
        self.ctx = ctx
        self.env = env

    async def chat(self, user_message):
        history = await self.ctx.storage.get("history")
        history = history.to_py() if history else []

        history.append({
            "role": "user",
            "content": user_message
        })

        prompt_text = """
        You are an AI assistant helping students understand Cloudflare technology, programming, and early career opportunities.

        Answer clearly and briefly.
        If the question is about Cloudflare careers or internships, explain it simply.

        Conversation:
        """
        for item in history:
            prompt_text += f"{item['role']}: {item['content']}\n"
        prompt_text += "\nassistant:"

        try:
            model = "@cf/meta/llama-3.1-8b-instruct"
            result = await self.env.AI.run(
                model,
                to_js({"prompt": prompt_text})
            )
        except Exception as e:
            return f"AI error with model {model}: {str(e)}"

        if hasattr(result, "to_py"):
            result = result.to_py()

        if isinstance(result, dict):
            reply = (
                result.get("response")
                or result.get("result", {}).get("response")
                or str(result)
            )
        else:
            reply = str(result)

        history.append({
            "role": "assistant",
            "content": reply
        })

        await self.ctx.storage.put("history", to_js(history))
        return reply

    async def clear_history(self):
        await self.ctx.storage.put("history", to_js([]))
        return "Memory cleared"


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        url = request.url
        path = url.split("://", 1)[-1].split("/", 1)[-1]
        path = "/" + path if not path.startswith("/") else path

        CORS_HEADERS = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }

        if path == "/api/chat":
            if request.method == "OPTIONS":
                return Response("", headers=CORS_HEADERS)

            session = body.get("session", "default")
            stub = self.env.MY_DURABLE_OBJECT.getByName(self.session)
            
            if request.method == "POST":
                body = await request.json()
                message = body.get("message", "").strip()

                if not message:
                    return Response(
                        json.dumps({"error": "Message is required"}),
                        status=400,
                        headers=CORS_HEADERS
                    )

                reply = await stub.chat(message)

                return Response(
                    json.dumps({"reply": reply}),
                    headers=CORS_HEADERS
                )

            if request.method == "DELETE":
                result = await stub.clear_history()
                return Response(
                    json.dumps({"message": result}),
                    headers=CORS_HEADERS
                )

            return Response(
                json.dumps({"error": "Method not allowed"}),
                status=405,
                headers=CORS_HEADERS
            )

        return Response(
            json.dumps({"error": "Not found"}),
            status=404,
            headers=CORS_HEADERS
        )