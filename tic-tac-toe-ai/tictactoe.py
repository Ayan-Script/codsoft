"""Simple static file server for the Tic-Tac-Toe frontend."""

from http.server import HTTPServer, SimpleHTTPRequestHandler


def run() -> None:
    server = HTTPServer(("127.0.0.1", 8000), SimpleHTTPRequestHandler)
    print("Serving Tic-Tac-Toe at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
