#!/usr/bin/env python3
"""Extrai as cartas do PDF de Cards Against Humanity e gera brancas.json / pretas.json.

Uso:
    python3 extract_cards.py <arquivo.pdf>

Layout esperado no PDF: grade de 4 colunas x 5 linhas (20 cartas por pagina).
Paginas 1-20 = cartas brancas (resposta). Paginas 21-24 = cartas pretas (completar frase).

Requer: pip install pdfplumber
"""

import json
import re
import sys

import pdfplumber

COLS = 4
ROWS = 5
WHITE_PAGES = range(1, 21)   # paginas 1 a 20
BLACK_PAGES = range(21, 25)  # paginas 21 a 24

BLANK_RE = re.compile(r"_{2,}")


def extract_page_cards(page):
    """Retorna as 20 cartas de uma pagina, em ordem de leitura (linha a linha)."""
    words = page.extract_words(use_text_flow=False, keep_blank_chars=False, x_tolerance=1.5)

    col_width = page.width / COLS
    row_height = page.height / ROWS

    cells = {}
    for w in words:
        col = min(int(w["x0"] // col_width), COLS - 1)
        row = min(int(w["top"] // row_height), ROWS - 1)
        cells.setdefault((row, col), []).append(w)

    cards = []
    for row in range(ROWS):
        for col in range(COLS):
            cell_words = cells.get((row, col), [])
            cell_words.sort(key=lambda w: (round(w["top"], 1), w["x0"]))
            text = " ".join(w["text"] for w in cell_words).strip()
            text = re.sub(r"\s+", " ", text)
            cards.append(text)
    return cards


def build_white_card(index, text):
    return {"id": index, "text": text}


def build_black_card(index, text):
    normalized = BLANK_RE.sub("_____", text)
    pick = len(BLANK_RE.findall(text)) or 1
    return {"id": index, "text": normalized, "pick": pick}


def main():
    if len(sys.argv) != 2:
        print("Uso: python3 extract_cards.py <arquivo.pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    brancas = []
    pretas = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num in WHITE_PAGES:
            page = pdf.pages[page_num - 1]
            for text in extract_page_cards(page):
                if text:
                    brancas.append(build_white_card(len(brancas) + 1, text))

        for page_num in BLACK_PAGES:
            page = pdf.pages[page_num - 1]
            for text in extract_page_cards(page):
                if text:
                    pretas.append(build_black_card(len(pretas) + 1, text))

    with open("brancas.json", "w", encoding="utf-8") as f:
        json.dump(brancas, f, ensure_ascii=False, indent=2)

    with open("pretas.json", "w", encoding="utf-8") as f:
        json.dump(pretas, f, ensure_ascii=False, indent=2)

    print(f"brancas.json: {len(brancas)} cartas")
    print(f"pretas.json: {len(pretas)} cartas")


if __name__ == "__main__":
    main()
