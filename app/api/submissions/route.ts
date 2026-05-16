import { NextRequest, NextResponse } from "next/server";
import { WEEK_CONFIG, UPSTREAM_REPO, Member, Status } from "@/lib/data";

// GitHub submission JSON shape
interface GhSubmission {
  githubHandle: string;
  name?: string;
  repoUrl?: string;
  liveUrl?: string;
  pitch?: string;
  loomUrl?: string;
}

// GitHub Contents API file entry
interface GhFile {
  name: string;
  download_url: string;
  sha: string;
}

// GitHub PR shape (abbreviated)
interface GhPR {
  number: number;
  html_url: string;
  head: { ref: string };
  user: { login: string };
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

/** Extract a githubHandle from a branch like submit-SimranKumari30-w1pm */
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
  const revalidate = 60; // cache for 60 s on the server

  try {
    // ── 1. Fetch open PRs targeting this week's branch ──────────────────────
    const prsUrl = `https://api.github.com/repos/${UPSTREAM_REPO}/pulls?base=${config.branch}&state=open&per_page=100`;
    const prsRes = await fetch(prsUrl, { headers, next: { revalidate } });
    const prs: GhPR[] = prsRes.ok ? await prsRes.json() : [];

    // Build a map of lowercase handle → PR URL for open PRs
    const openPrByHandle = new Map<string, string>(
      prs
        .map((pr) => {
          const handle = handleFromBranch(pr.head.ref) ?? pr.user.login.toLowerCase();
          return [handle, pr.html_url] as [string, string];
        })
        .filter(([h]) => Boolean(h))
    );
    const openPrHandles = new Set(openPrByHandle.keys());

    // ── 2. List JSON files in the submissions directory ──────────────────────
    const contentsUrl = `https://api.github.com/repos/${UPSTREAM_REPO}/contents/${config.submissionsPath}?ref=${config.branch}`;
    const contentsRes = await fetch(contentsUrl, { headers, next: { revalidate } });

    if (!contentsRes.ok) {
      // Branch or path doesn't exist yet — return open-PR stubs only (with resolved names)
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
          };
        })
      );
      return NextResponse.json({ members: stubMembers, sourceUrl: contentsUrl });
    }

    const files: GhFile[] = await contentsRes.json();
    const jsonFiles = files.filter((f) => f.name.endsWith(".json"));

    // ── 3. Fetch + parse each submission JSON ────────────────────────────────
    const settled = await Promise.allSettled(
      jsonFiles.map(async (f) => {
        const res = await fetch(f.download_url, { next: { revalidate } });
        if (!res.ok) return null;
        const data: GhSubmission = await res.json();
        if (!data.githubHandle) return null;

        const handleLower = data.githubHandle.toLowerCase();
        const status: Status = openPrHandles.has(handleLower) ? "pr_open" : "submitted";
        const fileUrl = `https://github.com/${UPSTREAM_REPO}/blob/${config.branch}/${config.submissionsPath}/${f.name}`;

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
          prUrl: openPrByHandle.get(handleLower),
          submissionUrl: fileUrl,
        };
        return member;
      })
    );

    const members: Member[] = settled
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((m): m is Member => m !== null);

    // ── 4. Add PR-only stubs for open PRs whose file isn't merged yet ────────
    const mergedHandles = new Set(members.map((m) => m.githubHandle.toLowerCase()));
    const prStubs = prs
      .map((pr) => handleFromBranch(pr.head.ref) ?? pr.user.login)
      .filter((handle) => !mergedHandles.has(handle.toLowerCase()));

    // Resolve real display names from GitHub user profiles (best-effort)
    const resolvedStubs = await Promise.allSettled(
      prStubs.map(async (handle, i) => {
        let displayName = handle;
        try {
          const userRes = await fetch(
            `https://api.github.com/users/${handle}`,
            { headers, next: { revalidate } }
          );
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.name) displayName = userData.name;
          }
        } catch { /* fall back to handle */ }

        return {
          id: `gh-pr-${i}`,
          name: displayName,
          githubHandle: handle,
          status: "pr_open" as Status,
          week,
          prUrl: openPrByHandle.get(handle.toLowerCase()),
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
