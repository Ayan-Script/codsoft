from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path
import pickle
import random

from flask import Flask, jsonify, render_template, request
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


BASE_DIR = Path(__file__).resolve().parent
OMDB_API_KEY = 'c794ac32'
RESULT_LIMIT = 20
SUGGESTION_LIMIT = 10
PLACEHOLDER_POSTER = 'https://placehold.co/500x750/171726/F4F0EA?text=No+Poster'
GENRE_LABELS = {
    'ScienceFiction': 'Science Fiction',
}

app = Flask(__name__)

with open(BASE_DIR / 'movies.pkl', 'rb') as movie_file:
    movies = pickle.load(movie_file)

with open(BASE_DIR / 'similarity.pkl', 'rb') as similarity_file:
    similarity = pickle.load(similarity_file)

TITLE_LOOKUP = {title.casefold(): title for title in movies['title'].tolist()}


def get_session():
    session = requests.Session()
    retry = Retry(total=2, backoff_factor=0.3)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('https://', adapter)
    session.mount('http://', adapter)
    return session


session = get_session()


def display_genres(genres):
    if not isinstance(genres, list):
        return []
    return [GENRE_LABELS.get(genre, genre) for genre in genres]


@lru_cache(maxsize=2048)
def get_poster(movie_title):
    if not OMDB_API_KEY:
        return PLACEHOLDER_POSTER

    try:
        response = session.get(
            'https://www.omdbapi.com/',
            params={'apikey': OMDB_API_KEY, 't': movie_title},
            timeout=4,
        )
        data = response.json()
        poster = data.get('Poster')
        if poster and poster != 'N/A':
            return poster
    except Exception as exc:
        print(f'[{movie_title}] poster lookup failed: {exc}')

    return PLACEHOLDER_POSTER


def resolve_movie_title(query):
    cleaned_query = (query or '').strip()
    if not cleaned_query:
        return None

    direct_match = TITLE_LOOKUP.get(cleaned_query.casefold())
    if direct_match:
        return direct_match

    lowered_query = cleaned_query.casefold()
    for title in TITLE_LOOKUP.values():
        folded = title.casefold()
        if folded.startswith(lowered_query):
            return title

    for title in TITLE_LOOKUP.values():
        if lowered_query in title.casefold():
            return title

    return None


def build_movie_cards(movie_indices, scores_by_index=None, include_posters=False):
    rows = [movies.iloc[index] for index in movie_indices]
    titles = [row['title'] for row in rows]
    posters = [None] * len(rows)

    if include_posters and titles:
        with ThreadPoolExecutor(max_workers=4) as executor:
            posters = list(executor.map(get_poster, titles))

    cards = []
    for index, row, poster in zip(movie_indices, rows, posters):
        cards.append({
            'title': row['title'],
            'genres': display_genres(row['genres']),
            'score': scores_by_index.get(index) if scores_by_index else None,
            'poster': poster,
        })
    return cards


def recommend(movie_title):
    matched_movies = movies[movies['title'] == movie_title]
    if matched_movies.empty:
        return []

    movie_index = matched_movies.index[0]
    distances = list(enumerate(similarity[movie_index]))
    ranked = sorted(distances, key=lambda item: item[1], reverse=True)[1:RESULT_LIMIT + 1]
    result_indices = [index for index, _ in ranked]
    scores_by_index = {
        index: round(float(score) * 100, 1)
        for index, score in ranked
    }
    return build_movie_cards(
        result_indices,
        scores_by_index=scores_by_index,
        include_posters=True,
    )


def get_initial_suggestions():
    available_indices = list(movies.index)
    chosen_indices = random.sample(
        available_indices,
        min(SUGGESTION_LIMIT, len(available_indices)),
    )
    return build_movie_cards(chosen_indices, include_posters=True)


@app.route('/')
def home():
    movie_list = sorted(movies['title'].tolist())
    return render_template(
        'index.html',
        movies=movie_list,
        suggested_movies=get_initial_suggestions(),
    )


@app.route('/recommend', methods=['POST'])
def get_recommendations():
    data = request.get_json(silent=True) or {}
    movie_query = data.get('movie', '')
    resolved_title = resolve_movie_title(movie_query)

    if not resolved_title:
        return jsonify({'error': 'Movie not found. Try a title from the suggestions.'}), 404

    return jsonify({
        'movie': resolved_title,
        'selected_poster': get_poster(resolved_title),
        'results': recommend(resolved_title),
    })


if __name__ == '__main__':
    app.run(debug=True)
