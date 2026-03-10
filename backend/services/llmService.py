import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question: str, context_chunks: list[str]):
    """
    Combines the user question with retrieved context to generate an answer.
    """
    # Combine chunks into a single context block
    context_text = "\n\n".join(context_chunks)
    
    system_prompt = (
        "You are a helpful assistant. Use the following pieces of retrieved context "
        "to answer the user's question. Always try to answer the question based on your knowledge before looking into the retrieved context" 
        "If you don't know the answer based on the context, just say that you don't know. Keep the answer concise.\n\n"
        f"Context:\n{context_text}"
    )

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content