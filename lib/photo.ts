import { Post, User } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PostRow = {
  id: string;
  title: string;
  caption: string;
  location: string;
  people_present: string[];
  image_url: string;
  storage_path: string;
  uploaded_by_id: string;
  created_at: string;
};

type CommentRow = {
  id: string;
  text: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

type RatingRow = {
  id: string;
  value: number;
  post_id: string;
  user_id: string;
  created_at: string;
};

export async function getUsersByIds(userIds: string[]) {
  const supabase = createSupabaseServerClient();
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return new Map<string, User>();

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, username, role, password_hash, created_at")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  const users = (data ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    passwordHash: user.password_hash,
    createdAt: user.created_at,
  })) satisfies User[];

  return new Map(users.map((user) => [user.id, user]));
}

export async function hydratePosts(postRows: PostRow[]) {
  const supabase = createSupabaseServerClient();
  const postIds = postRows.map((post) => post.id);
  const uploadedByIds = postRows.map((post) => post.uploaded_by_id);

  const [usersById, commentsResponse, ratingsResponse] = await Promise.all([
    getUsersByIds(uploadedByIds),
    postIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("comments")
          .select("id, text, post_id, user_id, created_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: true }),
    postIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("ratings")
          .select("id, value, post_id, user_id, created_at")
          .in("post_id", postIds),
  ]);

  if (commentsResponse.error) {
    throw new Error(commentsResponse.error.message);
  }

  if (ratingsResponse.error) {
    throw new Error(ratingsResponse.error.message);
  }

  const comments = (commentsResponse.data ?? []) as CommentRow[];
  const ratings = (ratingsResponse.data ?? []) as RatingRow[];
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
      people: post.people_present ?? [],
      image: post.image_url,
      createdAt: post.created_at,
      comments: postComments.map((comment) => ({
        id: comment.id,
        author: commentUsersById.get(comment.user_id)?.name ?? "Unknown User",
        text: comment.text,
        createdAt: comment.created_at,
      })),
      averageRating: ratingCount === 0 ? 0 : Number((totalRating / ratingCount).toFixed(1)),
      ratingCount,
    } satisfies Post;
  });
}
