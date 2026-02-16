import argparse
import json
import shutil
import sys
from pathlib import Path
from urllib.request import Request, urlopen


def download_file(url: str, destination: Path, timeout: int) -> None:
	destination.parent.mkdir(parents=True, exist_ok=True)
	request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
	with urlopen(request, timeout=timeout) as response, destination.open("wb") as handle:
		shutil.copyfileobj(response, handle)


def main() -> int:
	parser = argparse.ArgumentParser(
		description="Download GPX files for routes with 'São Miguel' in the title."
	)
	parser.add_argument(
		"--routes",
		default="routes.json",
		help="Path to routes.json (default: routes.json)",
	)
	parser.add_argument(
		"--output",
		default=str(Path("downloads") / "sao_miguel_gpx"),
		help="Output directory for downloaded GPX files",
	)
	parser.add_argument(
		"--timeout",
		type=int,
		default=30,
		help="Download timeout in seconds (default: 30)",
	)
	parser.add_argument(
		"--overwrite",
		action="store_true",
		help="Overwrite existing files",
	)
	args = parser.parse_args()

	routes_path = Path(args.routes)
	if not routes_path.exists():
		print(f"routes.json not found: {routes_path}", file=sys.stderr)
		return 1

	try:
		routes = json.loads(routes_path.read_text(encoding="utf-8"))
	except json.JSONDecodeError as exc:
		print(f"Invalid JSON in {routes_path}: {exc}", file=sys.stderr)
		return 1

	output_dir = Path(args.output)
	matches = [route for route in routes if "São Miguel" in route.get("title", "")]

	if not matches:
		print("No routes found with 'São Miguel' in the title.")
		return 0

	downloaded = 0
	skipped = 0
	failed = 0

	for route in matches:
		url = route.get("gpxFile")
		if not url:
			failed += 1
			print(f"Missing gpxFile for route: {route.get('title')}")
			continue

		filename = Path(url).name
		destination = output_dir / filename

		if destination.exists() and not args.overwrite:
			skipped += 1
			continue

		try:
			download_file(url, destination, args.timeout)
			downloaded += 1
		except Exception as exc:
			failed += 1
			print(f"Failed to download {url}: {exc}")

	print(
		"Completed: "
		f"{downloaded} downloaded, {skipped} skipped, {failed} failed."
	)
	return 0 if failed == 0 else 2


if __name__ == "__main__":
	raise SystemExit(main())
