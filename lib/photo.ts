import { Post, User } from "@/lib/types";
import { getSqlPool, sql } from "@/lib/azure-sql";

export type PostRow = {
  id: string;
  title: string;
  caption: string;
  location: string;
  people_present: string[] | string;
  image_url: string;
  storage_path: string;
  uploaded_by_id: string;
  created_at: string | Date;
};

type CommentRow = {
  id: string;
  text: string;
  post_id: string;
  user_id: string;
  created_at: string | Date;
};

type RatingRow = {
  id: string;
  value: number;
  post_id: string;
  user_id: string;
  created_at: string | Date;
};

function getIsoDate(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function getPeoplePresent(value: string[] | string) {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((person) => typeof person === "string") : [];
  } catch {
    return [];
  }
}

export async function getUsersByIds(userIds: string[]) {
  const pool = await getSqlPool();
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map<string, User>();

  const request = pool.request();
  const placeholders = uniqueIds.map((id, index) => {
    const key = `id${index}`;
    request.input(key, sql.NVarChar(64), id);
    return `@${key}`;
  });

  const result = await request.query<{
    id: string;
    name: string;
    email: string;
    username: string;
    role: "creator" | "consumer";
    password_hash: string;
    created_at: Date;
  }>(`
    SELECT id, name, email, username, role, password_hash, created_at
    FROM dbo.users
    WHERE id IN (${placeholders.join(", ")})
  `);

  const users = result.recordset.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    passwordHash: user.password_hash,
    createdAt: user.created_at.toISOString(),
  })) satisfies User[];

  return new Map(users.map((user) => [user.id, user]));
}

async function getRowsByPostIds<T>(tableName: "comments" | "ratings", postIds: string[], orderBy?: string) {
  const pool = await getSqlPool();
  if (postIds.length === 0) return [];

  const request = pool.request();
  const placeholders = postIds.map((id, index) => {
    const key = `postId${index}`;
    request.input(key, sql.NVarChar(64), id);
    return `@${key}`;
  });

  const orderClause = orderBy ? ` ORDER BY ${orderBy}` : "";
  const result = await request.query<T>(`
    SELECT *
    FROM dbo.${tableName}
    WHERE post_id IN (${placeholders.join(", ")})
    ${orderClause}
  `);

  return result.recordset;
}

export async function getPostRowsById(id: string) {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.NVarChar(64), id)
    .query<PostRow>(`
      SELECT id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at
      FROM dbo.posts
      WHERE id = @id
    `);

  return result.recordset;
}

export async function postExists(id: string) {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("id", sql.NVarChar(64), id)
    .query<{ id: string }>("SELECT TOP 1 id FROM dbo.posts WHERE id = @id");

  return Boolean(result.recordset[0]);
}

export async function getPhotoFeedRows(filters: { query?: string; location?: string; person?: string }) {
  const pool = await getSqlPool();
  const request = pool.request();
  const where: string[] = [];

  if (filters.query) {
    request.input("query", sql.NVarChar(255), `%${filters.query}%`);
    where.push("(title LIKE @query OR caption LIKE @query)");
  }

  if (filters.location) {
    request.input("location", sql.NVarChar(255), `%${filters.location}%`);
    where.push("location LIKE @location");
  }

  const result = await request.query<PostRow>(`
    SELECT id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at
    FROM dbo.posts
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY created_at DESC
  `);

  if (!filters.person) return result.recordset;

  const person = filters.person.toLowerCase();
  return result.recordset.filter((post) =>
    getPeoplePresent(post.people_present).some((listedPerson) => listedPerson.toLowerCase() === person)
  );
}

export async function hydratePosts(postRows: PostRow[]) {
  const postIds = postRows.map((post) => post.id);
  const uploadedByIds = postRows.map((post) => post.uploaded_by_id);

  const [usersById, comments, ratings] = await Promise.all([
    getUsersByIds(uploadedByIds),
    getRowsByPostIds<CommentRow>("comments", postIds, "created_at ASC"),
    getRowsByPostIds<RatingRow>("ratings", postIds),
  ]);

  const commentUsersById = await getUsersByIds(comments.map((comment) => comment.user_id));

  return postRows.map((post) => {
    const owner = usersById.get(post.uploaded_by_id);
    const postComments = comments.filter((comment) => comment.post_id === post.id);
    const postRatings = ratings.filter((rating) => rating.post_id === post.id);
    const ratingCount = postRatings.length;
    const totalRating = postRatings.reduce((sum, rating) => sum + rating.value, 0);

    return {
      id: post.id,
      title: post.title,
      owner: owner?.name ?? "Unknown User",
      username: owner?.username ?? "unknown",
      caption: post.caption,
      location: post.location,
      people: getPeoplePresent(post.people_present),
      image: post.image_url,
      createdAt: getIsoDate(post.created_at),
      comments: postComments.map((comment) => ({
        id: comment.id,
        author: commentUsersById.get(comment.user_id)?.name ?? "Unknown User",
        text: comment.text,
        createdAt: getIsoDate(comment.created_at),
      })),
      averageRating: ratingCount === 0 ? 0 : Number((totalRating / ratingCount).toFixed(1)),
      ratingCount,
    } satisfies Post;
  });
}
