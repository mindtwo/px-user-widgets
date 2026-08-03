#!/usr/bin/env python3
"""Read .nuxt/agent.log and print client + server entries as one timeline.

Usage:
    python3 trace.py .nuxt/agent.log                  # last 40 entries
    python3 trace.py .nuxt/agent.log --rid a3f91c02   # one request, both sides
    python3 trace.py .nuxt/agent.log --errors         # errors and failures only
    python3 trace.py .nuxt/agent.log --slow 500       # server requests over 500ms
    python3 trace.py .nuxt/agent.log --path /checkout # filter by route
"""

import argparse
import json
import sys

ERROR_LEVELS = {"error", "uncaught", "rejection", "vue", "app", "http", "network"}
ERROR_KINDS = {"error", "unhandledRejection", "uncaughtException"}


def load(path):
    entries = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                print(f"skipped malformed line {lineno}", file=sys.stderr)
    return entries


def is_error(e):
    return e.get("level") in ERROR_LEVELS or e.get("kind") in ERROR_KINDS


def matches(e, args):
    if args.rid and args.rid not in (e.get("rid"), e.get("ssrRid")):
        return False
    if args.errors and not is_error(e):
        return False
    if args.slow is not None and (e.get("ms") or 0) < args.slow:
        return False
    if args.path and args.path not in (e.get("path") or e.get("url") or ""):
        return False
    return True


def summarize(e):
    side = (e.get("side") or "?")[:6].ljust(6)
    rid = (e.get("rid") or e.get("ssrRid") or "--------")[:8]
    tag = e.get("level") or e.get("kind") or "?"

    bits = []
    if e.get("method") or e.get("status"):
        bits.append(" ".join(str(x) for x in (e.get("method"), e.get("status")) if x))
    if e.get("path") or e.get("url"):
        bits.append(str(e.get("path") or e.get("url")))
    if e.get("ms") is not None:
        bits.append(f"{e['ms']}ms")
    if e.get("message"):
        bits.append(str(e["message"]))
    if e.get("info"):
        bits.append(f"[{e['info']}]")
    if e.get("args"):
        bits.append(" ".join(json.dumps(a) if not isinstance(a, str) else a for a in e["args"]))

    head = f"{e.get('t', '')[11:23]:<12} {side} {rid} {tag:<10} " + "  ".join(bits)
    lines = [head]
    if e.get("stack"):
        for frame in str(e["stack"]).splitlines()[:6]:
            lines.append(f"{'':<12} {'':<6} {'':<8} {'':<10} {frame.strip()}")
    return "\n".join(lines)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("logfile", nargs="?", default=".nuxt/agent.log")
    p.add_argument("--rid", help="show everything sharing this request id")
    p.add_argument("--errors", action="store_true", help="errors and failed requests only")
    p.add_argument("--slow", type=int, metavar="MS", help="entries slower than MS")
    p.add_argument("--path", help="substring match on path or url")
    p.add_argument("-n", "--limit", type=int, default=40, help="max entries (default 40)")
    args = p.parse_args()

    try:
        entries = load(args.logfile)
    except FileNotFoundError:
        sys.exit(f"{args.logfile} not found — is the instrumentation installed and the bug reproduced?")

    selected = [e for e in entries if matches(e, args)]
    selected.sort(key=lambda e: e.get("t") or "")

    if not selected:
        print("no matching entries")
        return

    for e in selected[-args.limit:]:
        print(summarize(e))

    errors = sum(1 for e in selected if is_error(e))
    print(f"\n{len(selected)} entries shown, {errors} error-level", file=sys.stderr)


if __name__ == "__main__":
    main()
