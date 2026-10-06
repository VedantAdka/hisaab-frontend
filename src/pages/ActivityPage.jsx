import { useEffect, useState } from "react";
import { getGroupActivity } from "../api/activity";
import { useGroups } from "../context/GroupsContext";
import { colorFor, initial } from "../utils/avatarColor";
import { dayBucketLabel, relativeTime } from "../utils/format";

// There's no global "all my activity" endpoint on the backend — only
// GET /api/groups/{groupId}/activity — so this page fetches each group's
// activity and merges them into one feed, newest first.
export default function ActivityPage() {
  const { groups, loading: groupsLoading } = useGroups();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (groupsLoading) return;
    if (groups.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      groups.map((g) =>
        getGroupActivity(g.id)
          .then((activities) => activities.map((a) => ({ ...a, groupName: g.name })))
          .catch(() => [])
      )
    )
      .then((results) => {
        if (cancelled) return;
        const merged = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(merged);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load activity.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groups, groupsLoading]);

  const buckets = [];
  let lastBucket = null;
  for (const item of items) {
    const bucket = dayBucketLabel(item.createdAt);
    if (bucket !== lastBucket) {
      buckets.push({ label: bucket, items: [] });
      lastBucket = bucket;
    }
    buckets[buckets.length - 1].items.push(item);
  }

  return (
    <div>
      <div className="px-4 pt-5 pb-2 md:px-10 md:pt-8">
        <div className="text-xl md:text-2xl font-extrabold">Activity</div>
      </div>

      <div className="px-4 pb-24 md:px-10 md:pb-10 md:max-w-[720px]">
        {(loading || groupsLoading) && <div className="text-sm text-muted py-6">Loading activity...</div>}

        {!loading && error && (
          <div className="text-[13px] text-danger bg-danger-bg border border-danger-border rounded-xl2 px-3.5 py-2.5">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-muted py-6">Nothing here yet — create a group or add an expense to get started.</div>
        )}

        {!loading &&
          !error &&
          buckets.map((bucket) => (
            <div key={bucket.label}>
              <div className="text-[11px] text-muted font-bold tracking-wide px-0.5 pt-3.5 pb-2">{bucket.label}</div>
              {bucket.items.map((item) => (
                <div key={item.id} className="hs-card flex gap-3 bg-white rounded-xl2 p-3.5 mb-2">
                  <div
                    className="w-[34px] h-[34px] rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: colorFor(item.actorName) }}
                  >
                    {initial(item.actorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] leading-relaxed">{item.message}</div>
                    <div className="text-[11.5px] text-muted mt-0.5">
                      {item.groupName} &middot; {relativeTime(item.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
