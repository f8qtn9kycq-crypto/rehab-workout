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

# 直接讀 Build 的實際分組；僅解讀本設定使用的 context、fallback 與 event 比較。
# queue 模型依 GitHub 預設 single pending 語義：false 只保護 running，並不保護 pending。
concurrency = yaml.load((ROOT / '.github/workflows/build.yml').read_text(), Loader=yaml.BaseLoader)['concurrency']


def concurrency_context(event, run_id, number=None, ref='refs/heads/main', name='Build'):
    return {'github': {'workflow': name, 'event_name': event, 'run_id': run_id,
                       'ref': ref, 'event': {'pull_request': {'number': number}}}}


def concurrency_group(context):
    def resolve(match):
        value = None
        for fallback in match.group(1).strip().split('||'):
            path = fallback.strip()
            assert re.fullmatch(r'github(?:\.[a-z_]+)+', path), path
            value = context
            for key in path.split('.'):
                value = value.get(key) if isinstance(value, dict) else None
            if value not in (None, False, 0, ''):
                break
        return '' if value is None else str(value)
    return re.sub(r'\$\{\{(.*?)\}\}', resolve, concurrency['group']).lower()


def cancels_running(context):
    match = re.fullmatch(r"\$\{\{\s*github.event_name\s*==\s*'([^']+)'\s*\}\}",
                         concurrency['cancel-in-progress'])
    assert match, '取消條件改變時須更新語義驗證，不得默認通過'
    return context['github']['event_name'] == match.group(1)


def queue_cancellations(contexts):
    # 假定這一連串新 run 入隊期間沒有工作完成；每組最多一個 running、一個 pending。
    groups, cancelled = {}, []
    for context in contexts:
        group = concurrency_group(context)
        run_id = context['github']['run_id']
        running, pending = groups.get(group, (None, None))
        if pending is not None:
            cancelled.append(pending)
        if running is None:
            groups[group] = (run_id, None)
        elif cancels_running(context):
            cancelled.append(running)
            groups[group] = (run_id, None)
        else:
            groups[group] = (running, run_id)
    return cancelled


pr_one = concurrency_context('pull_request', 101, 247, 'refs/pull/247/merge')
pr_one_new = concurrency_context('pull_request', 102, 247, 'refs/pull/247/merge')
pr_two = concurrency_context('pull_request', 103, 248, 'refs/pull/248/merge')
assert concurrency_group(pr_one) == concurrency_group(pr_one_new)
assert concurrency_group(pr_one) != concurrency_group(pr_two)
assert concurrency_group(pr_one) != concurrency_group(concurrency_context('push', 247))
assert concurrency_group(pr_one) != concurrency_group(concurrency_context(
    'pull_request', 104, 247, 'refs/pull/247/merge', name='Other'))
assert cancels_running(pr_one) and not cancels_running(concurrency_context('push', 105))
assert queue_cancellations([pr_one, pr_two, pr_one_new]) == [101]

for ref in ('refs/heads/main', 'refs/heads/codex/example'):
    pushes = [concurrency_context('push', run_id, ref=ref) for run_id in (201, 202, 203)]
    assert queue_cancellations(pushes) == [], '同分支三次 push 不得取消 running 或 pending run'
    assert len({concurrency_group(context) for context in pushes}) == 3

assert queue_cancellations([pr_one, pr_one_new, concurrency_context(
    'pull_request', 104, 247, 'refs/pull/247/merge')]) == [101, 102]

print('Pass: YAML／form／shell、6事件、6 Build gate、3 review gate、2 API失敗，以及跨PR／事件／workflow隔離與running／pending取消模型（非真實GitHub事件）。')
