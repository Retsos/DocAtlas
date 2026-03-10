import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question: str, context_chunks: list[str], chat_history: list[dict] = None):
    """
    Combines the user question with retrieved context to generate an answer.
    """
    context_text = "\n\n".join(context_chunks)
    
    system_prompt = (
        "You are a strictly professional and helpful assistant for a specific organization. "
        "You MUST answer the user's question ONLY using the provided Context below. "
        "If the answer is NOT explicitly contained in the Context, you must reply EXACTLY with: "
        "'Δεν διαθέτω αυτή την πληροφορία. Παρακαλώ επικοινωνήστε απευθείας με το νοσοκομείο.' "
        "Do NOT use your internal general knowledge under any circumstances. Keep the answer concise and clear.\n\n"
        f"Context:\n{context_text}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    # Ρίχνουμε μέσα τις προηγούμενες ερωταπαντήσεις
    for msg in chat_history:
        # Το OpenAI δέχεται roles: "system", "user", "assistant" 
        role = "assistant" if msg.get("role") == "bot" else "user"
        messages.append({"role": role, "content": msg.get("content")})
        
    # Στο τέλος, η νέα ερώτηση
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=messages,
        temperature=0.2,
    )

    return response.choices[0].message.content