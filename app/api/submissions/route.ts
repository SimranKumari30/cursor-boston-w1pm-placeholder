import { NextRequest, NextResponse } from "next/server";
import { WEEK_CONFIG, UPSTREAM_REPO, Member, Status } from "@/lib/data";

interface GhSubmission {
  githubHandle: string;
  name?: string;
  repoUrl?: string;
  liveUrl?: string;
  pitch?: string;
  loomUrl?: string;
  competeForWin?: boolean;
}

interface GhFile {
  name: string;
  download_url: string;
  sha: string;
}

interface GhPR {
  number: number;
  html_url: string;
  created_at: string;
  head: { ref: string };
  user: { login: string };
}

interface GhCommit {
  commit: { author: { date: string } };
}

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

function handleFromBranch(ref: string): string | null {
  const m = ref.match(/^submit-(.+?)(?:-w\d|$)/i);
  return m ? m[1].toLowerCase() : null;
}

export async function GET(req: NextRequest) {
  const weekParam = req.nextUrl.searchParams.get("week");
  const week = parseInt(weekParam ?? "1", 10);
  const config = WEEK_CONFIG[week];

  if (!config) {
    return NextResponse.json({ members: [], error: "Unknown week" }, { status: 400 });
  }

  const headers = ghHeaders();
  const revalidate = 60;

  try {
    // ── 1. Fetch open PRs ────────────────────────────────────────────────────
    const prsUrl = `https://api.github.com/repos/${UPSTREAM_REPO}/pulls?base=${config.branch}&state=open&per_page=100`;
    const prsRes = await fetch(prsUrl, { headers, next: { revalidate } });
    const prs: GhPR[] = prsRes.ok ? await prsRes.json() : [];

    const openPrByHandle = new Map<string, { url: string; createdAt: string }>(
      prs
        .map((pr): [string, { url: string; createdAt: string }] => {
          const handle = handleFromBranch(pr.head.ref) ?? pr.user.login.toLowerCase();
          return [handle, { url: pr.html_url, createdAt: pr.created_at }];
        })
        .filter(([h]) => Boolean(h))
    );
    const openPrHandles = new Set(openPrByHandle.keys());

    // ── 2. List JSON files ───────────────────────────────────────────────────
    const contentsUrl = `https://api.github.com/repos/${UPSTREAM_REPO}/contents/${config.submissionsPath}?ref=${config.branch}`;
    const contentsRes = await fetch(contentsUrl, { headers, next: { revalidate } });

    if (!contentsRes.ok) {
      const stubMembers = await Promise.all(
        prs.map(async (pr, i) => {
          const handle = handleFromBranch(pr.head.ref) ?? pr.user.login;
          let displayName = handle;
          try {
            const userRes = await fetch(`https://api.github.com/users/${handle}`, { headers, next: { revalidate } });
            if (userRes.ok) {
              const userData = await userRes.json();
              if (userData.name) displayName = userData.name;
            }
          } catch { /* fall back */ }
          return {
            id: `gh-pr-${i}`,
            name: displayName,
            githubHandle: handle,
            status: "pr_open" as Status,
            week,
            prUrl: pr.html_url,
            submittedAt: pr.created_at,
          };
        })
      );
      return NextResponse.json({ members: stubMembers, sourceUrl: contentsUrl });
    }

    const files: GhFile[] = await contentsRes.json();
    const jsonFiles = files.filter((f) => f.name.endsWith(".json"));

    // ── 3. Fetch submission JSON + commit timestamp in parallel ──────────────
    const settled = await Promise.allSettled(
      jsonFiles.map(async (f) => {
        const [dataRes, commitRes] = await Promise.allSettled([
          fetch(f.download_url, { next: { revalidate } }),
          fetch(
            `https://api.github.com/repos/${UPSTREAM_REPO}/commits?path=${config.submissionsPath}/${f.name}&sha=${config.branch}&per_page=1`,
            { headers, next: { revalidate } }
          ),
        ]);

        if (dataRes.status !== "fulfilled" || !dataRes.value.ok) return null;
        const data: GhSubmission = await dataRes.value.json();
        if (!data.githubHandle) return null;

        const handleLower = data.githubHandle.toLowerCase();
        const status: Status = openPrHandles.has(handleLower) ? "pr_open" : "submitted";
        const fileUrl = `https://github.com/${UPSTREAM_REPO}/blob/${config.branch}/${config.submissionsPath}/${f.name}`;
        const pr = openPrByHandle.get(handleLower);

        let submittedAt: string | undefined;
        if (pr) {
          submittedAt = pr.createdAt;
        } else if (commitRes.status === "fulfilled" && commitRes.value.ok) {
          const commits: GhCommit[] = await commitRes.value.json();
          submittedAt = commits[0]?.commit.author.date;
        }

        const member: Member = {
          id: `gh-${data.githubHandle}`,
          name: data.name ?? data.githubHandle,
          githubHandle: data.githubHandle,
          pitch: data.pitch || undefined,
          repoUrl: data.repoUrl || undefined,
          liveUrl: data.liveUrl && data.liveUrl !== "https://example.com" ? data.liveUrl : undefined,
          loomUrl: data.loomUrl || undefined,
          status,
          week,
          prUrl: pr?.url,
          submissionUrl: fileUrl,
          submittedAt,
          competeForWin: data.competeForWin === true,
        };
        return member;
      })
    );

    const members: Member[] = settled
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((m): m is Member => m !== null);

    // ── 4. Add PR-only stubs ─────────────────────────────────────────────────
    const mergedHandles = new Set(members.map((m) => m.githubHandle.toLowerCase()));
    const prStubs = prs
      .map((pr) => ({ handle: handleFromBranch(pr.head.ref) ?? pr.user.login, pr }))
      .filter(({ handle }) => !mergedHandles.has(handle.toLowerCase()));

    const resolvedStubs = await Promise.allSettled(
      prStubs.map(async ({ handle, pr }, i) => {
        let displayName = handle;
        try {
          const userRes = await fetch(`https://api.github.com/users/${handle}`, { headers, next: { revalidate } });
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.name) displayName = userData.name;
          }
        } catch { /* fall back */ }

        return {
          id: `gh-pr-${i}`,
          name: displayName,
          githubHandle: handle,
          status: "pr_open" as Status,
          week,
          prUrl: pr.html_url,
          submittedAt: pr.created_at,
        } satisfies Member;
      })
    );

    resolvedStubs.forEach((r) => {
      if (r.status === "fulfilled") members.push(r.value);
    });

    return NextResponse.json({ members, sourceUrl: contentsUrl, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[submissions API]", err);
    return NextResponse.json({ members: [], error: String(err) }, { status: 500 });
  }
}
