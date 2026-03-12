def chunk_text(text: str, chunk_size: int = 600) -> list[str]:
    # Split input by lines first to keep nearby context together when possible.
    lines = text.split("\n")
    chunks: list[str] = []
    current_chunk = ""

    for line in lines:
        # Keep appending while the chunk stays under the target size.
        if len(current_chunk) + len(line) < chunk_size:
            current_chunk += " " + line if current_chunk else line
            continue

        if current_chunk:
            chunks.append(current_chunk.strip())

        # If one line is too long, split it by words as a fallback.
        if len(line) > chunk_size:
            words = line.split(" ")
            current_sub_chunk = ""
            for word in words:
                if len(current_sub_chunk) + len(word) < chunk_size:
                    current_sub_chunk += " " + word if current_sub_chunk else word
                else:
                    if current_sub_chunk:
                        chunks.append(current_sub_chunk.strip())
                    current_sub_chunk = word
            current_chunk = current_sub_chunk
        else:
            current_chunk = line

    # Flush the final chunk after iteration.
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks
