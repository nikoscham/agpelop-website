// Latest blog posts on the home page, loaded from the Blogger feed (JSONP callback)
const LATEST_POSTS_COUNT = 3;

function escapeHTML(text) {
  return (text || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

// Feed summaries can contain HTML entities and leftover Microsoft Word markup
function cleanExcerpt(summary) {
  const withoutComments = summary.replace(/<!--[\s\S]*?(-->|$)/g, " ");
  const decoder = document.createElement("textarea");
  decoder.innerHTML = withoutComments;
  const text = decoder.value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  // Word metadata such as "Normal 0 false false false EL X-NONE" is not a real excerpt
  return /\bmso\b|X-NONE|\bfalse false\b/i.test(text) ? "" : text;
}

function renderLatestPosts(data) {
  const list = document.getElementById("latest-posts");
  const entries = (data.feed.entry || [])
    // Skip the pinned welcome post, which is re-dated to stay on top of the blog
    .filter((entry) => !entry.title.$t.startsWith("Καλωσόρισμα"))
    .slice(0, LATEST_POSTS_COUNT);

  if (!entries.length) {
    latestPostsFailed();
    return;
  }

  list.innerHTML = entries
    .map((entry) => {
      const link = entry.link.find((l) => l.rel === "alternate");
      const date = new Date(entry.published.$t).toLocaleDateString("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const thumbnail = entry.media$thumbnail
        ? entry.media$thumbnail.url.replace(/\/s72(-[a-z0-9-]*)?\//, "/w240-h180-c/")
        : "assets/apple-touch-icon.png";
      let excerpt = cleanExcerpt(entry.summary ? entry.summary.$t : "");
      if (excerpt.length > 110) excerpt = excerpt.slice(0, 110).replace(/\s+\S*$/, "") + "…";

      return `
        <li>
          <a class="post-card" href="${escapeHTML(link ? link.href : "https://agpelop.blogspot.com/")}" target="_blank">
            <img src="${escapeHTML(thumbnail)}" alt="" loading="lazy" />
            <span class="post-text">
              <span class="post-date">${escapeHTML(date)}</span>
              <span class="post-title">${escapeHTML(entry.title.$t)}</span>
              ${excerpt ? `<span class="post-excerpt">${escapeHTML(excerpt)}</span>` : ""}
            </span>
          </a>
        </li>`;
    })
    .join("");
}

function latestPostsFailed() {
  document.getElementById("latest-posts").innerHTML =
    '<li class="latest-loading">Δεν ήταν δυνατή η φόρτωση των αναρτήσεων.</li>';
}

// Latest YouTube videos. The channel feed has no CORS headers, so it is read through rss2json;
// if that fails, the uploads playlist player already in the page stays as it is.
const LATEST_VIDEOS_COUNT = 2;
const YOUTUBE_FEED =
  "https://api.rss2json.com/v1/api.json?rss_url=" +
  encodeURIComponent("https://www.youtube.com/feeds/videos.xml?channel_id=UCAnQsfZS_HRfGFmXW_oszZg");

fetch(YOUTUBE_FEED)
  .then((response) => response.json())
  .then((data) => {
    const videos = (data.items || [])
      .map((item) => ({ id: (item.link.match(/[?&]v=([\w-]{11})/) || [])[1], title: item.title }))
      .filter((video) => video.id)
      .slice(0, LATEST_VIDEOS_COUNT);
    if (data.status !== "ok" || !videos.length) return;

    document.getElementById("latest-videos").innerHTML = videos
      .map(
        ({ id, title }) => `
          <div class="video-wrapper">
            <iframe
              src="https://www.youtube-nocookie.com/embed/${id}"
              title="${escapeHTML(title)}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>`,
      )
      .join("");
  })
  .catch(() => {});
