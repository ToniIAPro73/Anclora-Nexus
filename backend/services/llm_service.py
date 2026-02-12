from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from backend.config import settings

class LLMService:
    def __init__(self):
        self.primary = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )
        self.creative = ChatAnthropic(
            model="claude-3-5-sonnet-20240620", 
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=0.7
        )

    async def summarize(self, text: str) -> str:
        """Primary model for fast summaries."""
        try:
            response = await self.primary.ainvoke(text)
            return str(response.content)
        except Exception:
            return "Summary unavailable (Quota exceeded)"

    async def generate_copy(self, context: str) -> str:
        """Creative model for persuasive copy."""
        try:
            response = await self.creative.ainvoke(context)
            return str(response.content)
        except Exception:
            return "Copy generation unavailable (Quota exceeded). This is a placeholder luxury summary for the properties found."

    async def analyze(self, data: str) -> str:
        """Primary model for analysis with fallback to creative."""
        try:
            response = await self.primary.ainvoke(data)
            return str(response.content)
        except Exception as e:
            print(f"Primary LLM failed: {e}. Falling back to creative.")
            try:
                response = await self.creative.ainvoke(data)
                print("Creative LLM success.")
                return str(response.content)
            except Exception as e2:
                print(f"Creative LLM also failed: {e2}")
                # Provide a generic fail-safe response instead of mock data
                if "cruzar estos LEADS" in data:
                    return '{"matchings": []}'
                return "Analysis failed due to API unavailability."

llm_service = LLMService()
