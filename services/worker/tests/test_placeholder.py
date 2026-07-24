from app.main import main


def test_main_runs() -> None:
    # Smoke test: main() should run without raising.
    main()
