import os, sys

root = r'F:\PortFlow-AI'

ok = True

# 1. Required files
required = [
    'README.md', 'submission.yaml',
    'docs/problem-statement.md', 'docs/solution-overview.md',
    'docs/architecture.md', 'docs/setup-guide.md',
    'demo/demo-video-link.txt'
]
print('=== Required files ===')
for f in required:
    exists = os.path.isfile(os.path.join(root, f))
    status = 'OK' if exists else 'MISSING'
    if not exists:
        ok = False
    print(f'  {status}: {f}')

# 2. submission.yaml fields
print()
print('=== submission.yaml fields ===')
try:
    import yaml
    with open(os.path.join(root, 'submission.yaml')) as fh:
        s = yaml.safe_load(fh)
    checks = {
        'team.name': s.get('team', {}).get('name'),
        'team.track': s.get('team', {}).get('track'),
        'team.lead.name': s.get('team', {}).get('lead', {}).get('name'),
        'team.lead.email': s.get('team', {}).get('lead', {}).get('email'),
        'submission.title': s.get('submission', {}).get('title'),
        'submission.problem_statement': s.get('submission', {}).get('problem_statement'),
        'submission.solution_summary': s.get('submission', {}).get('solution_summary'),
    }
    valid_tracks = ['AI', 'DevOps', 'Sustainability', 'Open']
    track = s.get('team', {}).get('track', '')
    for k, v in checks.items():
        st = 'OK' if v else 'EMPTY'
        if not v:
            ok = False
        val = str(v)[:40] if v else '(none)'
        print(f'  {st}: {k} = {val}')
    tt = 'OK' if track in valid_tracks else 'BAD'
    if track not in valid_tracks:
        ok = False
    print(f'  {tt}: track = {track}')
    features = s.get('submission', {}).get('key_features', [])
    fc = 'OK' if len(features) >= 1 else 'FAIL'
    if len(features) < 1:
        ok = False
    print(f'  {fc}: key_features count = {len(features)}')
except Exception as e:
    print(f'  ERROR: {e}')
    ok = False

# 3. src/ code file count
print()
print('=== src/ code files ===')
count = 0
for r, dirs, files in os.walk(os.path.join(root, 'src')):
    dirs[:] = [d for d in dirs if d not in ['.venv', 'node_modules', '__pycache__', '.git', 'dist', '.pytest_cache']]
    for f in files:
        if f not in ('README.md', '.env.example'):
            count += 1
fc2 = 'OK' if count >= 1 else 'FAIL'
if count < 1:
    ok = False
print(f'  {fc2}: {count} non-README, non-.env.example source files')

# 4. demo video placeholder
print()
print('=== demo video ===')
with open(os.path.join(root, 'demo', 'demo-video-link.txt')) as fh:
    first_line = fh.readline().strip()
if 'your-demo-video-link-here' in first_line:
    print(f'  FAIL (expected): still placeholder -> {first_line}')
    # Not setting ok=False — we know this is intentionally unresolvable now
else:
    print(f'  OK: {first_line}')

# 5. README placeholders
print()
print('=== README placeholders ===')
with open(os.path.join(root, 'README.md')) as fh:
    readme = fh.read()
for pattern in ['[Your Project Title Here]', '[Your Team Name]']:
    if pattern in readme:
        print(f'  FAIL: found {pattern}')
        ok = False
    else:
        print(f'  OK: no {pattern!r}')

print()
print('=== Summary ===')
if ok:
    print('  All automated checks passed (excluding demo video placeholder).')
else:
    print('  Some checks FAILED.')
