#!/usr/bin/env python3
"""Insere as cartas de brancas.json / pretas.json no banco (tabelas white_cards / black_cards).

Uso:
    python3 seed_cards.py [brancas.json] [pretas.json]

Config de conexao via variaveis de ambiente (default = valores do application.yaml):
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=cartas_contra_humanidade
    DB_USER=postgres
    DB_PASSWORD=postgres

Idempotente: usa source_id como chave de conflito (ON CONFLICT ... DO UPDATE),
entao pode rodar de novo sem duplicar cartas.

Requer: pip install psycopg2-binary
"""

import json
import os
import sys
import uuid
from pathlib import Path

import psycopg2

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": os.environ.get("DB_PORT", "5432"),
    "dbname": os.environ.get("DB_NAME", "cartas_contra_humanidade"),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", "postgres"),
}

INSERT_WHITE_SQL = """
    INSERT INTO white_cards (id, source_id, text, created_at, updated_at)
    VALUES (%s, %s, %s, now(), now())
    ON CONFLICT (source_id) DO UPDATE
        SET text = EXCLUDED.text,
            updated_at = now()
    RETURNING id
"""

DELETE_WHITE_CATEGORIES_SQL = """
    DELETE FROM white_card_categories WHERE white_card_id = %s
"""

INSERT_WHITE_CATEGORY_SQL = """
    INSERT INTO white_card_categories (white_card_id, category)
    VALUES (%s, %s)
"""

INSERT_BLACK_SQL = """
    INSERT INTO black_cards (id, source_id, text, pick, created_at, updated_at)
    VALUES (%s, %s, %s, %s, now(), now())
    ON CONFLICT (source_id) DO UPDATE
        SET text = EXCLUDED.text,
            pick = EXCLUDED.pick,
            updated_at = now()
"""


def load_cards(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def seed_white_cards(cur, cards):
    for card in cards:
        cur.execute(INSERT_WHITE_SQL, (str(uuid.uuid4()), card["id"], card["text"]))
        white_card_id = cur.fetchone()[0]

        cur.execute(DELETE_WHITE_CATEGORIES_SQL, (white_card_id,))
        for category in card.get("categories", []):
            cur.execute(INSERT_WHITE_CATEGORY_SQL, (white_card_id, category))
    return len(cards)


def seed_black_cards(cur, cards):
    for card in cards:
        cur.execute(
            INSERT_BLACK_SQL,
            (str(uuid.uuid4()), card["id"], card["text"], card["pick"]),
        )
    return len(cards)


def main():
    script_dir = Path(__file__).resolve().parent
    brancas_path = Path(sys.argv[1]) if len(sys.argv) > 1 else script_dir / "brancas.json"
    pretas_path = Path(sys.argv[2]) if len(sys.argv) > 2 else script_dir / "pretas.json"

    brancas = load_cards(brancas_path)
    pretas = load_cards(pretas_path)

    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn:
            with conn.cursor() as cur:
                white_count = seed_white_cards(cur, brancas)
                black_count = seed_black_cards(cur, pretas)
    finally:
        conn.close()

    print(f"white_cards: {white_count} cartas inseridas/atualizadas")
    print(f"black_cards: {black_count} cartas inseridas/atualizadas")


if __name__ == "__main__":
    main()
