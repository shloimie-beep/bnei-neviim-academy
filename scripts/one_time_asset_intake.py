#!/usr/bin/env python3
"""One Time asset intake, private library, and redacted repo evidence.

This script is intentionally conservative: it preserves originals, stages ZIP
contents safely, records metadata, creates private contact sheets, and only
marks already-public legacy/repo assets as public-ready.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import math
import os
import re
import shutil
import subprocess
import sys
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import ExifTags, Image, ImageDraw, ImageFont, ImageOps


Image.MAX_IMAGE_PIXELS = None

IMAGE_EXTS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".heic",
    ".heif",
    ".gif",
    ".tif",
    ".tiff",
    ".bmp",
    ".svg",
}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}
ARCHIVE_EXTS = {".zip"}
HTML_EXTS = {".html", ".htm"}
SUPPORTED_EXTS = IMAGE_EXTS | VIDEO_EXTS | ARCHIVE_EXTS | HTML_EXTS
SUSPICIOUS_EXTS = {
    ".exe",
    ".dll",
    ".ps1",
    ".bat",
    ".cmd",
    ".com",
    ".scr",
    ".msi",
    ".vbs",
    ".js",
    ".jse",
    ".wsf",
    ".lnk",
}

ALIASES = [
    "Rabbi Elie Scheller",
    "Rabbi Ellie Scheller",
    "Rabbi Eli Scheller",
    "Rabbi Scheller",
    "Rabbi Sheller",
    "Elie Scheller",
    "One Time",
    "One Time",
    "One Time Mishnayos",
    "One Time Mishnayos",
]

LOCATION_WORDS = {
    "adamstown",
    "atlanta",
    "baltimore",
    "boca",
    "boston",
    "dallas",
    "edison",
    "flatbush",
    "florida",
    "hollywood",
    "holywood",
    "lakewood",
    "las vegas",
    "manhattan",
    "miami",
    "norfolk",
    "orlando",
    "passaic",
    "philadelphia",
    "silver spring",
    "st louis",
    "tampa",
    "toronto",
    "virginia",
}


@dataclass
class SourceFile:
    path: Path
    source_kind: str
    source_label: str
    archive_path: str | None = None
    archive_entry: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def slugify(value: str, fallback: str = "asset") -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or fallback


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def safe_copy(src: Path, dest_dir: Path, preferred_name: str | None = None) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    name = preferred_name or src.name
    stem = Path(name).stem
    suffix = Path(name).suffix
    dest = dest_dir / name
    index = 2
    while dest.exists():
        dest = dest_dir / f"{stem}-{index:02d}{suffix}"
        index += 1
    shutil.copy2(src, dest)
    return dest


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_image_metadata(path: Path) -> dict[str, Any]:
    meta: dict[str, Any] = {
        "width": None,
        "height": None,
        "orientation": "",
        "color_profile": "",
        "exif_capture_date": "",
        "camera_metadata": {},
        "gps_present": False,
        "transparency": False,
        "alpha_background_behavior": "",
        "perceptual_hash": "",
        "metadata_error": "",
    }
    if path.suffix.lower() == ".svg":
        text = path.read_text(encoding="utf-8", errors="ignore")[:4000]
        width = re.search(r'\bwidth=["\']?([0-9.]+)', text)
        height = re.search(r'\bheight=["\']?([0-9.]+)', text)
        viewbox = re.search(r'\bviewBox=["\']([^"\']+)["\']', text)
        if width and height:
            meta["width"] = int(float(width.group(1)))
            meta["height"] = int(float(height.group(1)))
        elif viewbox:
            parts = re.split(r"[\s,]+", viewbox.group(1).strip())
            if len(parts) == 4:
                meta["width"] = int(float(parts[2]))
                meta["height"] = int(float(parts[3]))
        meta["orientation"] = orientation(meta.get("width"), meta.get("height"))
        return meta
    try:
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img)
            meta["width"], meta["height"] = img.size
            meta["orientation"] = orientation(meta["width"], meta["height"])
            meta["color_profile"] = img.mode
            meta["transparency"] = img.mode in {"RGBA", "LA"} or ("transparency" in img.info)
            meta["alpha_background_behavior"] = "transparent" if meta["transparency"] else "opaque"
            exif = img.getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag = ExifTags.TAGS.get(tag_id, str(tag_id))
                    if tag in {"DateTimeOriginal", "DateTimeDigitized", "DateTime"} and not meta["exif_capture_date"]:
                        meta["exif_capture_date"] = str(value)
                    if tag in {"Make", "Model", "LensModel", "Software"}:
                        meta["camera_metadata"][tag] = str(value)
                    if tag == "GPSInfo":
                        meta["gps_present"] = True
            meta["perceptual_hash"] = average_hash(img)
    except Exception as exc:  # Pillow may not support HEIC/AVIF in this runtime.
        meta["metadata_error"] = str(exc)
    return meta


def average_hash(img: Image.Image) -> str:
    try:
        small = ImageOps.grayscale(img).resize((8, 8), Image.Resampling.LANCZOS)
        pixels = list(small.getdata())
        avg = sum(pixels) / len(pixels)
        bits = ["1" if p >= avg else "0" for p in pixels]
        return f"{int(''.join(bits), 2):016x}"
    except Exception:
        return ""


def hamming_hex(a: str, b: str) -> int:
    if not a or not b:
        return 999
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def orientation(width: int | None, height: int | None) -> str:
    if not width or not height:
        return ""
    if abs(width - height) <= max(width, height) * 0.05:
        return "square"
    return "horizontal" if width > height else "vertical"


def parse_ffmpeg_metadata(path: Path, ffmpeg: Path | None) -> dict[str, Any]:
    meta: dict[str, Any] = {
        "duration_seconds": None,
        "width": None,
        "height": None,
        "frame_rate": "",
        "codec": "",
        "audio_channels": "",
        "bitrate": "",
        "rotation": "",
        "metadata_error": "",
    }
    if not ffmpeg or not ffmpeg.exists():
        meta["metadata_error"] = "ffmpeg not available"
        return meta
    proc = subprocess.run(
        [str(ffmpeg), "-hide_banner", "-i", str(path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore",
    )
    out = proc.stdout
    dur = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", out)
    if dur:
        meta["duration_seconds"] = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))
    bitrate = re.search(r"bitrate:\s*([^,\n]+)", out)
    if bitrate:
        meta["bitrate"] = bitrate.group(1).strip()
    stream = re.search(r"Video:\s*([^,\n]+).*?,\s*(\d{2,5})x(\d{2,5}).*?(?:(\d+(?:\.\d+)?)\s*fps)?", out)
    if stream:
        meta["codec"] = stream.group(1).strip()
        meta["width"] = int(stream.group(2))
        meta["height"] = int(stream.group(3))
        if stream.group(4):
            meta["frame_rate"] = stream.group(4)
    audio = re.search(r"Audio:.*?,\s*([^,\n]*channels|stereo|mono)", out)
    if audio:
        meta["audio_channels"] = audio.group(1).strip()
    rotation = re.search(r"rotation\s*:\s*([^\n]+)", out, re.IGNORECASE)
    if rotation:
        meta["rotation"] = rotation.group(1).strip()
    if not meta["codec"]:
        meta["metadata_error"] = "unable to parse ffmpeg output"
    return meta


def classify_file(source: SourceFile, meta: dict[str, Any]) -> tuple[str, str, str]:
    name = source.path.name.lower()
    full = f"{source.source_label} {source.archive_entry or ''} {source.path.name}".lower()
    ext = source.path.suffix.lower()
    category = "Unknown-Needs-Review"
    shot_type = "unknown"
    subject = "Needs visual review"
    if ext in VIDEO_EXTS:
        category = "Video-Clips"
        shot_type = "video clip"
        subject = "Video clip"
    elif ext in HTML_EXTS:
        category = "Legacy-Site"
        shot_type = "downloaded page"
        subject = "Downloaded legacy page"
    elif "logo" in name or "onetimelogo" in name:
        category = "Logos-and-Brand"
        shot_type = "logo"
        subject = "One Time logo/brand"
    elif any(word in full for word in ["mishpacha", "torahanytime", "loop", "twentyfour", "24six", "24 six"]):
        category = "Press-and-Publications"
        shot_type = "publication logo"
        subject = "Publication/platform logo"
    elif "hero" in name or "portrait" in name or "profile" in name or "pic" == Path(name).stem:
        category = "Rabbi-Portraits"
        shot_type = "portrait"
        subject = "Rabbi/founder portrait candidate"
    elif any(word in full for word in LOCATION_WORDS):
        category = "Worldwide-Locations"
        shot_type = "location/community"
        subject = "Worldwide location/community candidate"
    elif any(word in name for word in ["dsc", "photo", "img"]):
        category = "Teaching"
        shot_type = "event/teaching"
        subject = "Teaching or event candidate"
    elif "kid" in name or "family" in name:
        category = "Students-and-Families-Private-Review"
        shot_type = "family/child candidate"
        subject = "Student/family private review candidate"
    return category, shot_type, subject


def rights_status(record: dict[str, Any]) -> tuple[str, str]:
    name = record["original_filename"].lower()
    category = record["category"]
    source = record["source_kind"]
    if record.get("exact_duplicate_of"):
        return "duplicate", "Exact byte duplicate; canonical original retained in manifest."
    if "kid" in name or "family" in name or category == "Students-and-Families-Private-Review":
        return "minor_present_needs_consent", "Student/family/minor risk; do not publish without verified consent."
    if category == "Press-and-Publications":
        return "publication_logo_permission_check", "Publication/platform logo requires accurate permission/status wording."
    if source == "repo_public_existing":
        return "approved_public", "Already tracked public derivative from prior One Time shared review."
    if source == "legacy_site" and category in {"Logos-and-Brand", "Rabbi-Portraits", "Teaching", "Video-Clips"}:
        return "legacy_public_needs_confirmation", "Legacy public source; keep private until explicit publication approval."
    if category == "Worldwide-Locations":
        return "crowd_needs_review", "Location/community image likely includes identifiable people; review consent before publishing."
    if category in {"Rabbi-Portraits", "Teaching"}:
        return "rabbi_only_likely_safe", "Likely Rabbi/event asset, but visual/rights approval is still needed."
    if category == "Video-Clips":
        return "unknown_needs_review", "Video needs rights, privacy, and content review before use."
    return "unknown_needs_review", "No reliable rights or content determination from filename/metadata alone."


def score_record(record: dict[str, Any]) -> dict[str, Any]:
    width = record.get("width") or 0
    height = record.get("height") or 0
    mp = (width * height) / 1_000_000 if width and height else 0
    category = record["category"]
    status = record["rights_status"]
    brand = 5 if category in {"Rabbi-Portraits", "Teaching", "Worldwide-Locations", "Logos-and-Brand"} else 2
    quality = 1 if not mp else min(5, 2 + int(mp >= 0.5) + int(mp >= 1.5) + int(mp >= 4))
    privacy = 5 if status == "approved_public" else 4 if status == "rabbi_only_likely_safe" else 2 if "review" in status else 1
    crop = 4 if record.get("orientation") in {"horizontal", "vertical", "square"} else 2
    return {
        "brand_fit": brand,
        "visual_quality": quality,
        "authenticity": 4 if category != "Logos-and-Brand" else 3,
        "crop_flexibility": crop,
        "mobile_usability": 4 if record.get("orientation") in {"vertical", "square"} else 3,
        "desktop_usability": 4 if record.get("orientation") == "horizontal" else 3,
        "text_overlay_usability": 4 if category in {"Teaching", "Worldwide-Locations"} else 2,
        "privacy_rights_safety": privacy,
        "uniqueness": 3 if record.get("near_duplicate_group") else 4,
        "emotional_credibility": 4 if category in {"Rabbi-Portraits", "Teaching", "Worldwide-Locations"} else 2,
        "reason": f"{category}; {record.get('orientation') or 'unknown'}; rights {status}.",
    }


def zip_entries(zip_path: Path) -> list[dict[str, Any]]:
    rows = []
    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            rows.append(
                {
                    "full_name": info.filename,
                    "file_size": info.file_size,
                    "compress_size": info.compress_size,
                    "date_time": "-".join(map(str, info.date_time[:3])),
                    "suspicious": is_suspicious_zip_entry(info.filename),
                }
            )
    return rows


def is_suspicious_zip_entry(name: str) -> bool:
    normalized = name.replace("\\", "/")
    if normalized.startswith("/") or re.match(r"^[a-zA-Z]:", normalized):
        return True
    if any(part == ".." for part in normalized.split("/")):
        return True
    return Path(normalized).suffix.lower() in SUSPICIOUS_EXTS


def extract_zip_safely(zip_path: Path, dest: Path) -> tuple[list[Path], list[str]]:
    extracted: list[Path] = []
    warnings: list[str] = []
    dest.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            if is_suspicious_zip_entry(info.filename):
                warnings.append(f"rejected suspicious entry {info.filename}")
                continue
            target = (dest / info.filename).resolve()
            if dest.resolve() not in target.parents:
                warnings.append(f"rejected path traversal {info.filename}")
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as src, target.open("wb") as out:
                shutil.copyfileobj(src, out)
            extracted.append(target)
    return extracted, warnings


def discover_sources(downloads: Path, staging_root: Path, archives_meta: list[dict[str, Any]]) -> list[SourceFile]:
    sources: list[SourceFile] = []
    alias_re = re.compile("|".join(re.escape(a) for a in ALIASES), re.IGNORECASE)
    recent_drive_zip_re = re.compile(r"drive-download-20260622T1436|drive-download-20260622T1437", re.IGNORECASE)

    zip_paths = []
    for path in downloads.rglob("*"):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext == ".zip" and (alias_re.search(str(path)) or recent_drive_zip_re.search(path.name)):
            zip_paths.append(path)
        elif ext in (IMAGE_EXTS | VIDEO_EXTS | HTML_EXTS) and alias_re.search(str(path)):
            sources.append(SourceFile(path=path, source_kind="legacy_site", source_label=str(path.parent)))

    for zip_path in sorted(zip_paths, key=lambda p: p.stat().st_mtime, reverse=True):
        zip_hash = sha256_file(zip_path)
        entries = zip_entries(zip_path)
        suspicious = [e for e in entries if e["suspicious"]]
        archive_slug = slugify(zip_path.stem)[:80] + "-" + zip_hash[:8]
        extract_dest = staging_root / "archives" / archive_slug
        extracted: list[Path] = []
        warnings: list[str] = []
        if suspicious:
            warnings.append("archive contained suspicious entries and was not extracted")
        else:
            extracted, warnings = extract_zip_safely(zip_path, extract_dest)
        archives_meta.append(
            {
                "path": str(zip_path),
                "size": zip_path.stat().st_size,
                "modified_time": datetime.fromtimestamp(zip_path.stat().st_mtime).isoformat(),
                "sha256": zip_hash,
                "entry_count": len(entries),
                "total_uncompressed": sum(e["file_size"] for e in entries),
                "suspicious_entries": suspicious,
                "warnings": warnings,
                "staging_extract_path": str(extract_dest),
                "entries": entries,
            }
        )
        for item in extracted:
            if item.suffix.lower() in IMAGE_EXTS | VIDEO_EXTS | HTML_EXTS:
                sources.append(
                    SourceFile(
                        path=item,
                        source_kind="archive_extract",
                        source_label=zip_path.name,
                        archive_path=str(zip_path),
                        archive_entry=str(item.relative_to(extract_dest)),
                    )
                )

    return sources


def add_existing_repo_public_assets(repo_root: Path, sources: list[SourceFile]) -> None:
    for rel in [
        "public/images/one-time/brand/onetimelogo.webp",
        "public/images/one-time/brand/onetime-hero-vertical.webp",
        "public/images/one-time/teaching/promo-stage-still-01.webp",
        "public/images/one-time/teaching/promo-stage-still-02.webp",
        "public/images/one-time/teaching/promo-stage-still-03.webp",
        "public/images/one-time/press/torahanytime-logo.png",
        "public/images/one-time/press/twentyfour-six-logo.png",
        "public/images/one-time/press/loop-logo.png",
        "public/images/one-time/press/mishpacha.webp",
    ]:
        path = repo_root / rel
        if path.exists():
            sources.append(SourceFile(path=path, source_kind="repo_public_existing", source_label=rel))


def organized_name(record: dict[str, Any]) -> str:
    ext = Path(record["original_filename"]).suffix.lower()
    category = record["category"]
    stem = Path(record["original_filename"]).stem
    if category == "Worldwide-Locations":
        base = "one-time-worldwide-location"
        location = slugify(stem)
        return f"{base}-{location}-undated-{record['id'].lower()}{ext}"
    if category == "Rabbi-Portraits":
        return f"rabbi-elie-scheller-portrait-undated-{record['id'].lower()}{ext}"
    if category == "Teaching":
        return f"rabbi-elie-scheller-teaching-event-undated-{record['id'].lower()}{ext}"
    if category == "Video-Clips":
        return f"rabbi-elie-scheller-one-time-video-clip-undated-{record['id'].lower()}{ext}"
    if category == "Logos-and-Brand":
        return f"one-time-brand-{slugify(stem)}-{record['id'].lower()}{ext}"
    if category == "Press-and-Publications":
        return f"one-time-publication-logo-{slugify(stem)}-{record['id'].lower()}{ext}"
    return f"one-time-needs-review-{slugify(stem)}-{record['id'].lower()}{ext}"


def make_contact_sheet(records: list[dict[str, Any]], out_path: Path) -> None:
    image_records = [
        r for r in records if r["media_type"] == "image" and r.get("local_original_path") and not r.get("image_metadata", {}).get("metadata_error")
    ]
    thumb_w, thumb_h = 220, 160
    label_h = 62
    cols = 4
    rows = max(1, math.ceil(len(image_records) / cols))
    sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for idx, record in enumerate(image_records):
        x = (idx % cols) * thumb_w
        y = (idx // cols) * (thumb_h + label_h)
        try:
            with Image.open(record["local_original_path"]) as img:
                img = ImageOps.exif_transpose(img).convert("RGB")
                img.thumbnail((thumb_w - 10, thumb_h - 10), Image.Resampling.LANCZOS)
                sheet.paste(img, (x + (thumb_w - img.width) // 2, y + 5))
        except Exception:
            draw.rectangle([x + 5, y + 5, x + thumb_w - 5, y + thumb_h - 5], outline="red")
        label = f"{record['id']} {record['category']}\n{record['original_filename'][:34]}\n{record['rights_status']}"
        draw.text((x + 6, y + thumb_h + 4), label, fill="black", font=font)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, quality=88)


def make_video_frames(record: dict[str, Any], ffmpeg: Path | None, frames_root: Path) -> list[str]:
    if not ffmpeg or not ffmpeg.exists():
        return []
    duration = record.get("duration_seconds") or 0
    if duration <= 0:
        times = [1]
    else:
        times = sorted(set(max(0, min(duration - 0.2, duration * p)) for p in [0.08, 0.25, 0.5, 0.75, 0.92]))
    out_dir = frames_root / record["id"]
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for i, t in enumerate(times, start=1):
        out = out_dir / f"frame-{i:02d}.jpg"
        cmd = [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", record["local_original_path"], "-frames:v", "1", "-q:v", "3", str(out)]
        try:
            subprocess.run(cmd, check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if out.exists() and out.stat().st_size:
                paths.append(str(out))
        except Exception:
            pass
    return paths


def write_html_reports(local_root: Path, records: list[dict[str, Any]], selections: list[dict[str, Any]]) -> None:
    contact_dir = local_root / "05-Contact-Sheets"
    rows = []
    for r in records:
        thumb = ""
        if r["media_type"] == "image" and r.get("local_original_path"):
            thumb = f'<img src="{Path(r["local_original_path"]).as_uri()}" loading="lazy" />'
        rows.append(
            "<tr>"
            f"<td>{html.escape(r['id'])}</td>"
            f"<td>{thumb}</td>"
            f"<td>{html.escape(r['original_filename'])}</td>"
            f"<td>{html.escape(r['category'])}</td>"
            f"<td>{html.escape(r['rights_status'])}</td>"
            f"<td>{html.escape(r.get('orientation') or '')}</td>"
            f"<td>{html.escape(str(r.get('width') or ''))}x{html.escape(str(r.get('height') or ''))}</td>"
            f"<td>{html.escape(r.get('local_organized_path') or '')}</td>"
            "</tr>"
        )
    css = """
    body { font-family: Arial, sans-serif; margin: 24px; background: #faf9f4; color: #10131a; }
    table { border-collapse: collapse; width: 100%; background: white; }
    th, td { border: 1px solid #d9dee7; padding: 8px; vertical-align: top; font-size: 13px; }
    img { max-width: 180px; max-height: 140px; object-fit: contain; background: #eee; }
    .note { max-width: 900px; line-height: 1.5; }
    """
    (contact_dir / "all-images.html").write_text(
        "<!doctype html><meta charset=\"utf-8\"><title>One Time Asset Contact Sheet</title>"
        f"<style>{css}</style><h1>One Time Asset Contact Sheet</h1>"
        "<p class=\"note\">Private review sheet. Rights statuses are conservative; do not publish assets marked needs review, consent, permission check, duplicate, or private.</p>"
        "<table><thead><tr><th>ID</th><th>Thumb</th><th>Filename</th><th>Category</th><th>Rights</th><th>Orientation</th><th>Dimensions</th><th>Organized copy</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table>",
        encoding="utf-8",
    )
    video_rows = []
    for r in records:
        if r["media_type"] != "video":
            continue
        frames = "".join(f'<img src="{Path(p).as_uri()}" loading="lazy" />' for p in r.get("contact_sheet_frames", []))
        video_rows.append(
            "<tr>"
            f"<td>{html.escape(r['id'])}</td>"
            f"<td>{frames}</td>"
            f"<td>{html.escape(r['original_filename'])}</td>"
            f"<td>{html.escape(str(r.get('duration_seconds') or ''))}</td>"
            f"<td>{html.escape(str(r.get('width') or ''))}x{html.escape(str(r.get('height') or ''))}</td>"
            f"<td>{html.escape(r['rights_status'])}</td>"
            f"<td>{html.escape(r.get('local_organized_path') or '')}</td>"
            "</tr>"
        )
    (contact_dir / "video-contact-sheets.html").write_text(
        "<!doctype html><meta charset=\"utf-8\"><title>One Time Video Contact Sheets</title>"
        f"<style>{css}</style><h1>One Time Video Contact Sheets</h1>"
        "<table><thead><tr><th>ID</th><th>Frames</th><th>Filename</th><th>Duration</th><th>Dimensions</th><th>Rights</th><th>Organized copy</th></tr></thead>"
        f"<tbody>{''.join(video_rows)}</tbody></table>",
        encoding="utf-8",
    )
    selection_rows = []
    for s in selections:
        selection_rows.append(
            "<tr>"
            f"<td>{s['rank']}</td><td>{html.escape(s['use'])}</td><td>{html.escape(s['asset_id'])}</td>"
            f"<td>{html.escape(s['organized_local_path'])}</td><td>{html.escape(s['repo_derivative_path'])}</td>"
            f"<td>{html.escape(s['crop'])}</td><td>{html.escape(s['rights_status'])}</td><td>{html.escape(s['reason'])}</td>"
            "</tr>"
        )
    (local_root / "START-HERE.html").write_text(
        "<!doctype html><meta charset=\"utf-8\"><title>One Time Asset Library</title>"
        f"<style>{css}</style><h1>One Time Asset Library</h1>"
        "<p class=\"note\">Start with the contact sheets and selection ranking. Originals are preserved under <strong>01-Originals</strong>; organized working copies are under <strong>02-Organized</strong>; publication candidates are under <strong>03-Selected</strong>; web exports are under <strong>04-Web-Exports</strong>.</p>"
        '<ul><li><a href="05-Contact-Sheets/all-images.html">All image contact sheet</a></li>'
        '<li><a href="05-Contact-Sheets/video-contact-sheets.html">Video contact sheets</a></li>'
        '<li><a href="06-Manifests-and-Reports/asset-inventory.md">Inventory report</a></li>'
        '<li><a href="06-Manifests-and-Reports/selection-ranking.md">Selection ranking</a></li>'
        '<li><a href="06-Manifests-and-Reports/rights-review.md">Rights review</a></li></ul>'
        "<h2>Top Selections</h2><table><thead><tr><th>Rank</th><th>Use</th><th>Asset</th><th>Local path</th><th>Repo derivative</th><th>Crop</th><th>Rights</th><th>Reason</th></tr></thead>"
        f"<tbody>{''.join(selection_rows)}</tbody></table>",
        encoding="utf-8",
    )


def write_markdown_reports(
    local_root: Path,
    repo_root: Path,
    repo_evidence_dir: Path,
    records: list[dict[str, Any]],
    archives_meta: list[dict[str, Any]],
    selections: list[dict[str, Any]],
) -> None:
    reports = local_root / "06-Manifests-and-Reports"
    image_count = sum(1 for r in records if r["media_type"] == "image")
    video_count = sum(1 for r in records if r["media_type"] == "video")
    html_count = sum(1 for r in records if r["media_type"] == "html")
    exact_groups = defaultdict(list)
    for r in records:
        exact_groups[r["sha256"]].append(r["id"])
    duplicate_groups = {k: v for k, v in exact_groups.items() if len(v) > 1}
    by_rights = defaultdict(int)
    for r in records:
        by_rights[r["rights_status"]] += 1

    inventory_md = [
        "# One Time Asset Inventory",
        "",
        f"Generated: {now_iso()}",
        f"Local library root: `{local_root}`",
        "",
        "## Counts",
        "",
        f"- Images: {image_count}",
        f"- Videos: {video_count}",
        f"- HTML/downloaded pages: {html_count}",
        f"- Archives inspected: {len(archives_meta)}",
        f"- Exact duplicate groups: {len(duplicate_groups)}",
        "",
        "## Archives",
        "",
    ]
    for archive in archives_meta:
        inventory_md.extend(
            [
                f"- `{archive['path']}`",
                f"  - SHA-256: `{archive['sha256']}`",
                f"  - entries: {archive['entry_count']}; total uncompressed: {archive['total_uncompressed']}",
                f"  - staging: `{archive['staging_extract_path']}`",
            ]
        )
    inventory_md.extend(["", "## Rights Status Counts", ""])
    for status, count in sorted(by_rights.items()):
        inventory_md.append(f"- {status}: {count}")
    inventory_md.extend(["", "## Records", ""])
    for r in records:
        inventory_md.append(
            f"- {r['id']} `{r['original_filename']}` - {r['media_type']}, {r['category']}, {r['rights_status']}, {r.get('width') or '?'}x{r.get('height') or '?'}"
        )
    (reports / "asset-inventory.md").write_text("\n".join(inventory_md) + "\n", encoding="utf-8")

    rights_md = [
        "# One Time Rights Review",
        "",
        "Conservative statuses are assigned from source, filename, metadata, and visual-review category. Anything not `approved_public` must stay private until Shloimie/Rabbi/rights owner approves it.",
        "",
    ]
    for r in records:
        if r["rights_status"] != "approved_public":
            rights_md.append(f"- {r['id']} `{r['original_filename']}`: **{r['rights_status']}** - {r['rights_reason']}")
    (reports / "rights-review.md").write_text("\n".join(rights_md) + "\n", encoding="utf-8")

    selection_md = [
        "# One Time Selection Ranking",
        "",
        "| rank | use | asset | organized local path | repo derivative path | dimensions | crop | rights status | reason |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for s in selections:
        selection_md.append(
            f"| {s['rank']} | {s['use']} | {s['asset_id']} | `{s['organized_local_path']}` | `{s['repo_derivative_path']}` | {s['dimensions']} | {s['crop']} | {s['rights_status']} | {s['reason']} |"
        )
    (reports / "selection-ranking.md").write_text("\n".join(selection_md) + "\n", encoding="utf-8")

    write_json(reports / "duplicate-groups.json", {"exact_duplicate_groups": duplicate_groups})

    repo_evidence_dir.mkdir(parents=True, exist_ok=True)
    summary = [
        "# One Time Asset Intake Summary",
        "",
        f"Generated: {now_iso()}",
        f"Local library root: `{local_root}`",
        "",
        "## Counts",
        "",
        f"- Archives inspected: {len(archives_meta)}",
        f"- Images inventoried: {image_count}",
        f"- Videos inventoried: {video_count}",
        f"- HTML/downloaded pages inventoried: {html_count}",
        f"- Exact duplicate groups: {len(duplicate_groups)}",
        "",
        "## Guardrails",
        "",
        "- Downloads originals were not deleted, renamed, or moved.",
        "- ZIPs were listed before extraction and extracted only to `.runtime` staging.",
        "- Public repository derivatives are limited to already-tracked/approved public assets unless a future approval changes the rights state.",
        "- GPS coordinates are not written to tracked evidence; only a boolean GPS-present field is kept in the private manifest.",
    ]
    (repo_evidence_dir / "SUMMARY.md").write_text("\n".join(summary) + "\n", encoding="utf-8")

    public_derivatives = [
        {
            "use": s["use"],
            "asset_id": s["asset_id"],
            "repo_derivative_path": s["repo_derivative_path"],
            "rights_status": s["rights_status"],
            "source": "existing approved repo asset" if s["repo_derivative_path"] else "private review only",
        }
        for s in selections
    ]
    write_json(repo_evidence_dir / "PUBLIC-DERIVATIVES.json", public_derivatives)
    (repo_evidence_dir / "SELECTION-MAP.md").write_text("\n".join(selection_md) + "\n", encoding="utf-8")
    blockers = [
        "# One Time Asset Rights Blockers",
        "",
        "The following blockers prevent automatic publication of newly downloaded assets:",
        "",
        "- Newly downloaded worldwide/community/location images likely include identifiable people and need rights/consent review.",
        "- Student/family/minor-looking assets require verified consent before any public use.",
        "- Publication/platform logos require accurate, non-misleading permission/status wording.",
        "- HEIC/AVIF files may need extra visual tooling before final review if Pillow cannot decode them.",
    ]
    (repo_evidence_dir / "RIGHTS-BLOCKERS.md").write_text("\n".join(blockers) + "\n", encoding="utf-8")


def build_selections(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id = {r["id"]: r for r in records}

    def candidates(*categories: str, public_only: bool = False) -> list[dict[str, Any]]:
        rows = [r for r in records if r["category"] in categories and r["media_type"] == "image"]
        if public_only:
            rows = [r for r in rows if r["rights_status"] == "approved_public"]
        return sorted(rows, key=lambda r: (r["scores"]["privacy_rights_safety"], r["scores"]["visual_quality"], r["scores"]["brand_fit"]), reverse=True)

    existing_public = [r for r in records if r["source_kind"] == "repo_public_existing"]
    def public_by_name(part: str) -> dict[str, Any] | None:
        for r in existing_public:
            if part in r["source_label"].lower() or part in r["original_filename"].lower():
                return r
        return None

    uses = [
        ("Public hero video", None, "Vimeo stream 1158542993?h=daa31d3417", "16:9 video embed", "approved_public", "Use the known public Vimeo promo ID; do not use lesson ID 1178363755 as hero."),
        ("Public hero poster", public_by_name("promo-stage-still-01"), "", "16:9 center crop", "", "Existing public stage still is safest while new downloads await rights review."),
        ("Alternate hero still", public_by_name("promo-stage-still-02"), "", "16:9 center crop", "", "Existing public teaching still, already tracked."),
        ("Worldwide locations slideshow", None, "", "16:9 per image", "crowd_needs_review", "Private shortlist exists in contact sheet; no newly downloaded crowd/location image should be published until consent/status review."),
        ("As seen across the Jewish world visual proof section", public_by_name("torahanytime"), "", "logo strip", "", "Existing platform/publication logo asset requires accurate wording."),
        ("Founder/Rabbi portrait near the bottom", public_by_name("onetime-hero-vertical"), "", "4:5 portrait crop", "", "Existing public Rabbi portrait is safest pending review of new portraits."),
        ("Small circular/square Rabbi avatar", public_by_name("onetime-hero-vertical"), "", "1:1 face crop", "", "Use existing public portrait for avatar crop."),
        ("Live-shiur section image", public_by_name("promo-stage-still-03"), "", "16:9 center crop", "", "Existing public stage still supports the live-shiur section."),
        ("Worksheets/accountability section image", None, "", "16:9 or document crop", "unknown_needs_review", "No clearly approved worksheet/accountability asset was found in the new downloads."),
        ("Video-library section image", public_by_name("promo-stage-still-01"), "", "16:9 thumbnail", "", "Existing public teaching still supports class/video thumbnails."),
        ("Social Open Graph image", public_by_name("onetime-hero-vertical"), "public/images/one-time/social/one-time-og-20260622.jpg", "1200x630 composed crop", "", "Use existing public portrait/brand only; generated derivative can be tracked after composition."),
        ("Mobile hero fallback", public_by_name("onetime-hero-vertical"), "", "portrait mobile crop", "", "Existing vertical hero is mobile-friendly."),
        ("Email header image", public_by_name("promo-stage-still-02"), "", "wide email crop", "", "Existing public teaching still can work in email header."),
        ("Member-library thumbnail set", public_by_name("promo-stage-still-01"), "", "16:9 thumbnails", "", "Existing stage stills are safe placeholders until lesson thumbnails are approved."),
    ]
    selections: list[dict[str, Any]] = []
    rank = 1
    for use, record, repo_override, crop, forced_status, reason in uses:
        if record is None:
            dims = ""
            organized = ""
            asset_id = ""
            status = forced_status
            repo_path = repo_override
        else:
            dims = f"{record.get('width') or '?'}x{record.get('height') or '?'}"
            organized = record.get("local_organized_path") or ""
            asset_id = record["id"]
            status = forced_status or record["rights_status"]
            repo_path = repo_override or (record["source_label"] if record["source_kind"] == "repo_public_existing" else "")
        selections.append(
            {
                "rank": rank,
                "use": use,
                "asset_id": asset_id,
                "organized_local_path": organized,
                "repo_derivative_path": repo_path,
                "dimensions": dims,
                "crop": crop,
                "rights_status": status,
                "reason": reason,
            }
        )
        rank += 1
    return selections


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", required=True)
    parser.add_argument("--downloads", default=str(Path.home() / "Downloads"))
    parser.add_argument("--local-root", default=str(Path.home() / "Documents" / "BNA-Assets" / "One-Time"))
    parser.add_argument("--timestamp", default=datetime.now().strftime("%Y%m%dT%H%M%S"))
    parser.add_argument("--ffmpeg", default="")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    downloads = Path(args.downloads).resolve()
    local_root = Path(args.local_root).resolve()
    staging_root = repo_root / ".runtime" / "one-time-asset-intake" / args.timestamp
    repo_evidence_dir = repo_root / "ops" / "one-time-mishnah" / "asset-intake" / "2026-06-22"
    ffmpeg = Path(args.ffmpeg).resolve() if args.ffmpeg else repo_root / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"
    if not ffmpeg.exists():
        ffmpeg = None

    for rel in [
        "00-Inbox-Snapshot",
        "01-Originals/Images",
        "01-Originals/Videos",
        "01-Originals/Archives",
        "01-Originals/Legacy-Site",
        "02-Organized/Rabbi-Portraits",
        "02-Organized/Teaching",
        "02-Organized/Stages-and-Venues",
        "02-Organized/Worldwide-Locations",
        "02-Organized/Students-and-Families-Private-Review",
        "02-Organized/Community",
        "02-Organized/Press-and-Publications",
        "02-Organized/Logos-and-Brand",
        "02-Organized/Worksheets-and-Documents",
        "02-Organized/Video-Clips",
        "02-Organized/Unknown-Needs-Review",
        "03-Selected/Hero",
        "03-Selected/Hero-Posters",
        "03-Selected/Location-Slideshow",
        "03-Selected/Founder-Section",
        "03-Selected/Community-Avatar",
        "03-Selected/Library-Thumbnails",
        "03-Selected/Social-Share",
        "04-Web-Exports/AVIF",
        "04-Web-Exports/WebP",
        "04-Web-Exports/JPEG-Fallback",
        "04-Web-Exports/Video-Posters",
        "05-Contact-Sheets",
        "06-Manifests-and-Reports",
        "99-Quarantine",
    ]:
        (local_root / rel).mkdir(parents=True, exist_ok=True)

    archives_meta: list[dict[str, Any]] = []
    sources = discover_sources(downloads, staging_root, archives_meta)
    add_existing_repo_public_assets(repo_root, sources)

    for archive in archives_meta:
        safe_copy(Path(archive["path"]), local_root / "01-Originals" / "Archives")
    write_json(local_root / "00-Inbox-Snapshot" / f"download-snapshot-{args.timestamp}.json", {"archives": archives_meta, "source_count": len(sources)})

    records: list[dict[str, Any]] = []
    for idx, source in enumerate(sources, start=1):
        ext = source.path.suffix.lower()
        media_type = "image" if ext in IMAGE_EXTS else "video" if ext in VIDEO_EXTS else "html"
        sha = sha256_file(source.path)
        image_meta = read_image_metadata(source.path) if media_type == "image" else {}
        video_meta = parse_ffmpeg_metadata(source.path, ffmpeg) if media_type == "video" else {}
        meta = image_meta if media_type == "image" else video_meta
        category, shot_type, subject = classify_file(source, meta)
        record = {
            "id": f"A{idx:04d}",
            "source_path": str(source.path),
            "archive_source": source.archive_path or "",
            "archive_entry": source.archive_entry or "",
            "source_kind": source.source_kind,
            "source_label": source.source_label,
            "original_filename": source.archive_entry or source.path.name,
            "sha256": sha,
            "file_type": ext.lstrip("."),
            "media_type": media_type,
            "file_size": source.path.stat().st_size,
            "modified_time": datetime.fromtimestamp(source.path.stat().st_mtime).isoformat(),
            "category": category,
            "primary_subject": subject,
            "shot_type": shot_type,
            "people_count": "unknown",
            "rabbi_present": "unknown",
            "child_minor_present": "unknown",
            "audience_crowd_present": "unknown",
            "location_venue": "",
            "event": "",
            "expression_mood": "",
            "visual_quality_note": "",
            "sharpness": "needs visual review",
            "lighting": "needs visual review",
            "background_quality": "needs visual review",
            "text_overlays": "unknown",
            "safe_text_area": "unknown",
            "likely_web_uses": [],
            "image_metadata": image_meta,
            "video_metadata": video_meta,
            "width": meta.get("width"),
            "height": meta.get("height"),
            "orientation": orientation(meta.get("width"), meta.get("height")),
            "duration_seconds": meta.get("duration_seconds"),
            "duplicate_group": "",
            "near_duplicate_group": "",
            "exact_duplicate_of": "",
            "local_original_path": "",
            "local_organized_path": "",
            "contact_sheet_frames": [],
        }
        orig_dir = local_root / "01-Originals" / ("Images" if media_type == "image" else "Videos" if media_type == "video" else "Legacy-Site")
        record["local_original_path"] = str(safe_copy(source.path, orig_dir, f"{record['id'].lower()}-{slugify(Path(record['original_filename']).stem)}{ext}"))
        organized = local_root / "02-Organized" / category
        record["local_organized_path"] = str(safe_copy(source.path, organized, organized_name(record)))
        records.append(record)

    by_sha = defaultdict(list)
    for r in records:
        by_sha[r["sha256"]].append(r)
    for group_index, group in enumerate([g for g in by_sha.values() if len(g) > 1], start=1):
        group_id = f"DG{group_index:03d}"
        canonical = sorted(group, key=lambda r: (r["source_kind"] != "repo_public_existing", r["id"]))[0]
        for r in group:
            r["duplicate_group"] = group_id
            if r["id"] != canonical["id"]:
                r["exact_duplicate_of"] = canonical["id"]

    image_hashes = [r for r in records if r["media_type"] == "image" and r["image_metadata"].get("perceptual_hash")]
    parent = {r["id"]: r["id"] for r in image_hashes}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a: str, b: str) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for i, a in enumerate(image_hashes):
        for b in image_hashes[i + 1 :]:
            if hamming_hex(a["image_metadata"]["perceptual_hash"], b["image_metadata"]["perceptual_hash"]) <= 8:
                union(a["id"], b["id"])
    groups = defaultdict(list)
    for r in image_hashes:
        groups[find(r["id"])].append(r)
    near_index = 1
    for group in groups.values():
        if len(group) <= 1:
            continue
        group_id = f"NDG{near_index:03d}"
        near_index += 1
        for r in group:
            r["near_duplicate_group"] = group_id

    frames_root = local_root / "05-Contact-Sheets" / "video-frames"
    for r in records:
        status, reason = rights_status(r)
        r["rights_status"] = status
        r["rights_reason"] = reason
        r["scores"] = score_record(r)
        if r["media_type"] == "video":
            r["contact_sheet_frames"] = make_video_frames(r, ffmpeg, frames_root)

    selections = build_selections(records)
    for s in selections:
        if s["organized_local_path"] and s["rights_status"] == "approved_public":
            selected_dir = local_root / "03-Selected" / slugify(s["use"]).title().replace("-", "-")
            try:
                safe_copy(Path(s["organized_local_path"]), selected_dir)
            except Exception:
                pass

    reports = local_root / "06-Manifests-and-Reports"
    write_json(reports / "asset-inventory.json", {"generated_at": now_iso(), "records": records, "archives": archives_meta, "selections": selections})
    with (reports / "asset-inventory.csv").open("w", encoding="utf-8", newline="") as f:
        fields = [
            "id",
            "media_type",
            "original_filename",
            "sha256",
            "file_type",
            "width",
            "height",
            "orientation",
            "duration_seconds",
            "category",
            "shot_type",
            "rights_status",
            "duplicate_group",
            "near_duplicate_group",
            "local_original_path",
            "local_organized_path",
            "source_path",
            "archive_source",
            "archive_entry",
        ]
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for r in records:
            writer.writerow(r)

    make_contact_sheet(records, local_root / "05-Contact-Sheets" / "all-images-contact-sheet.jpg")
    write_html_reports(local_root, records, selections)
    write_markdown_reports(local_root, repo_root, repo_evidence_dir, records, archives_meta, selections)

    print(json.dumps({"local_root": str(local_root), "repo_evidence_dir": str(repo_evidence_dir), "records": len(records), "archives": len(archives_meta)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
