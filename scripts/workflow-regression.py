#!/usr/bin/env python3
"""以本機 fixture 執行 workflow 原始 shell；不連線、不寫入 GitHub。"""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import textwrap
import yaml

ROOT = Path(__file__).resolve().parents[1]
workflow = (ROOT / '.github/workflows/project-auto-add.yml').read_text()

# YAML 1.2 的 on 不應依 YAML 1.1 被轉成布林值；此處只檢查結構與 scalar 類型。
for path in (ROOT / '.github').rglob('*.yml'):
    data = yaml.load(path.read_text(), Loader=yaml.BaseLoader)
    assert isinstance(data, dict), path
    if 'ISSUE_TEMPLATE' in str(path):
        for field in data.get('body', []):
            attributes = field.get('attributes', {})
            for key in ('label', 'description', 'placeholder', 'value'):
                if key in attributes:
                    assert isinstance(attributes[key], str), (path, key)
            for option in attributes.get('options', []):
                assert isinstance(option, str), (path, option)


def shell_blocks(source):
    return [textwrap.dedent(match) for match in re.findall(
        r'^        run: \|\n((?:(?:          .*|)\n)+)', source, re.M)]


for path in (ROOT / '.github/workflows').glob('*.yml'):
    for block in shell_blocks(path.read_text()):
        subprocess.run(['bash', '-n'], input=block, text=True, check=True)

resolver = next(block for block in shell_blocks(workflow) if 'targets=$targets' in block)


def execute(script, fixture, env=None):
    with tempfile.TemporaryDirectory() as temp:
        directory = Path(temp)
        (directory / 'fixture.json').write_text(json.dumps(fixture))
        (directory / 'output').touch()
        context = dict(os.environ, GITHUB_REPOSITORY='test/repo',
                       GITHUB_OUTPUT=str(directory / 'output'), **(env or {}))
        # 測試只允許固定 JSON 回覆，避免 gh 意外呼叫外部服務。
        result = subprocess.run(['bash', '-c',
            'set -euo pipefail\ngh() { cat "$FIXTURE"; return "${GH_FIXTURE_EXIT:-0}"; }\n' + script],
            env=dict(context, FIXTURE=str(directory / 'fixture.json')),
            text=True, capture_output=True)
        return result.returncode, (directory / 'output').read_text(), result.stderr


for event, payload, fixture, expected in [
    ('issues', {'issue': {'number': 7}}, [], [{'type': 'issue', 'number': 7}]),
    ('pull_request_target', {'pull_request': {'number': 8}}, [], [{'type': 'pull_request', 'number': 8}]),
    ('workflow_dispatch', {'inputs': {'target_type': 'pull_request', 'target_number': '9'}}, [], [{'type': 'pull_request', 'number': 9}]),
    ('workflow_run', {'workflow_run': {'head_sha': 'a'*40, 'pull_requests': [{'number': 10}, {'number': 11}]}}, [], [{'type': 'pull_request', 'number': 10}, {'type': 'pull_request', 'number': 11}]),
    ('workflow_run', {'workflow_run': {'head_sha': 'a'*40, 'pull_requests': []}}, [[{'state': 'open', 'number': 12}, {'state': 'closed', 'number': 13}]], [{'type': 'pull_request', 'number': 12}]),
    ('workflow_run', {'workflow_run': {'head_sha': 'a'*40, 'pull_requests': []}}, [[]], []),
]:
    with tempfile.TemporaryDirectory() as temp:
        event_path = Path(temp) / 'event.json'
        event_path.write_text(json.dumps(payload))
        code, output, error = execute(resolver, fixture, {'GITHUB_EVENT_NAME': event, 'GITHUB_EVENT_PATH': str(event_path)})
        assert code == 0, error
        assert json.loads(output.removeprefix('targets=')) == expected, output


def function(name):
    match = re.search(r'^          ' + name + r'\(\) \{\n.*?^          \}', workflow, re.M | re.S)
    assert match, name
    return textwrap.dedent(match.group())


def build(run_id=1, app='github-actions', status='completed', conclusion='success', sha='a'*40):
    return dict(id=run_id, app={'slug': app}, name='build', head_sha=sha, status=status, conclusion=conclusion)


for checks, expected in [
    ([build()], True),
    ([build(app='other')], False),
    ([build(sha='b'*40)], False),
    ([], False),
    ([build(), build(2, status='in_progress', conclusion=None)], False),
    ([build(), build(2, conclusion='failure')], False),
]:
    code, _, error = execute(function('has_successful_current_head_build') + '\nhas_successful_current_head_build ' + 'a'*40,
                             [{'check_runs': checks}])
    assert (code == 0) == expected, error

for reviews, expected in [
    ([{'user': {'login': 'reviewer'}, 'state': 'CHANGES_REQUESTED', 'submitted_at': '1'},
      {'user': {'login': 'reviewer'}, 'state': 'COMMENTED', 'submitted_at': '2'}], False),
    ([{'user': {'login': 'reviewer'}, 'state': 'CHANGES_REQUESTED', 'submitted_at': '1'},
      {'user': {'login': 'reviewer'}, 'state': 'DISMISSED', 'submitted_at': '2'}], True),
    ([], True),
]:
    code, _, error = execute('target_number=8\n' + function('has_no_active_requested_changes') + '\nhas_no_active_requested_changes', [reviews])
    assert (code == 0) == expected, error

for name, call, fixture in [
    ('has_successful_current_head_build', 'has_successful_current_head_build ' + 'a'*40, [{'check_runs': [build()]}]),
    ('has_no_active_requested_changes', 'has_no_active_requested_changes', [[]]),
]:
    code, _, _ = execute('target_number=8\n' + function(name) + '\n' + call, fixture, {'GH_FIXTURE_EXIT': '1'})
    assert code != 0, 'API 失敗必須保守阻擋 ' + name

print('Pass: YAML／issue form 結構、workflow shell 語法、6 個事件 fixture、6 個 Build gate 與 3 個 review gate 與 2 個 API 失敗情境。')
