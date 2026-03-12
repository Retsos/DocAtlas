import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question: str, context_chunks: list[str], chat_history: list[dict] = None):

    #Combines the user question with retrieved context to generate an answer.
    context_text = "\n\n".join(context_chunks)
    
    system_prompt = (
        "You are a strictly professional and helpful assistant for a specific organization. "
        "1. PROCEDURAL QUERIES: If Context is provided below, you MUST answer the user's question ONLY using that Context. "
        "If the answer is NOT explicitly contained in the Context, you must reply EXACTLY with: "
        "'Δεν διαθέτω αυτή την πληροφορία. Παρακαλώ επικοινωνήστε απευθείας με το νοσοκομείο.'\n"
        "2. GENERAL CONVERSATION: If no Context is provided, you may engage in brief, polite small talk or greetings.\n"
        "Do NOT use your internal general knowledge to answer factual questions under any circumstances. Keep the answer concise and clear.\n\n"
        f"Context:\n{context_text}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    #Feeds the conversation history to maintain context across turns, if available
    if chat_history:
        for msg in chat_history:
            # Maps the original roles to OpenAI's expected format
            role = "assistant" if msg.get("role") == "bot" else "user"
            messages.append({"role": role, "content": msg.get("content")})
        
    #The new question is added as the latest user message for the model to respond to
    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=messages,
        temperature=0.2,
    )

    return response.choices[0].message.content


def classify_intent(user_prompt: str):
    
    #Classifies the user's input into one of three categories.
    classification_prompt = (
        "Classify the user's input into exactly one of these categories: 'MEDICAL', 'GENERAL', or 'PROCEDURAL'.\n"
        "- MEDICAL: Questions about symptoms, diagnoses, or health advice.\n"
        "- GENERAL: Greetings, small talk, or polite closing remarks.\n"
        "- PROCEDURAL: Questions about hospital rules, documents, or how to do something.\n\n"
        f"User input: {user_prompt}\n"
        "Category:"
    )

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": classification_prompt}],
        temperature=0.1,
        max_tokens=10
    )
    return response.choices[0].message.content.strip().upper()