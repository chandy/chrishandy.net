/** statechart view for PostVisibility.tla — reader-facing labels only */

export const title = "Blog post visibility";

export const state = (v) => {
  const when =
    v.pubRel === "Past"
      ? "published"
      : v.pubRel === "Margin"
        ? "inside early window"
        : "still scheduled";
  const kind = v.draft ? "draft" : "non-draft";
  const surfaces = Array.isArray(v.exposed) ? [...v.exposed].sort() : [];
  const where =
    surfaces.length === 0
      ? "hidden everywhere"
      : `shown on ${surfaces.join(", ")}`;
  return `${kind}, ${when}: ${where}`;
};

export const step = (action, _from, _to) => {
  switch (action) {
    case "ExposeHome":
      return "the home page lists the post";
    case "ExposePostsList":
      return "the posts listing includes the post";
    case "ExposeRss":
      return "the RSS feed includes the post";
    case "ExposeTags":
      return "a tag page includes the post";
    case "ExposePostPage":
      return "the post page is built";
    case "ExposeArchives":
      return "archives lists the post";
    case "ExposeOg":
      return "an OG image route is built";
    case "Stutter":
      return null;
    default:
      return action;
  }
};

export const group = (v) => {
  if (v.draft) return "draft";
  if (v.pubRel === "Future") return "scheduled";
  return "publishable";
};

export const colors = {
  draft: "orange",
  scheduled: "purple",
  publishable: "teal",
};
