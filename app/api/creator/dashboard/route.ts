import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { getPostRowsByOwnerId, hydratePosts } from "@/lib/photo";

export const runtime = "nodejs";

type CreatorStatsRow = {
  total_uploads: number;
  total_comments: number;
  total_ratings: number;
  average_rating: number | null;
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (user.role !== "creator") {
    return NextResponse.json({ message: "Only creators can view this dashboard." }, { status: 403 });
  }

  const pool = await getSqlPool();
  const [statsResult, postRows] = await Promise.all([
    pool
      .request()
      .input("userId", sql.NVarChar(64), user.id)
      .query<CreatorStatsRow>(`
        SELECT
          COUNT(DISTINCT p.id) AS total_uploads,
          COUNT(DISTINCT c.id) AS total_comments,
          COUNT(DISTINCT r.id) AS total_ratings,
          AVG(CAST(r.value AS FLOAT)) AS average_rating
        FROM dbo.posts p
        LEFT JOIN dbo.comments c ON c.post_id = p.id
        LEFT JOIN dbo.ratings r ON r.post_id = p.id
        WHERE p.uploaded_by_id = @userId
      `),
    getPostRowsByOwnerId(user.id),
  ]);

  const stats = statsResult.recordset[0] ?? {
    total_uploads: 0,
    total_comments: 0,
    total_ratings: 0,
    average_rating: null,
  };
  const posts = await hydratePosts(postRows);
  const topPost = [...posts].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0] ?? null;

  return NextResponse.json({
    stats: {
      totalUploads: stats.total_uploads,
      totalComments: stats.total_comments,
      totalRatings: stats.total_ratings,
      averageRating: stats.average_rating ? Number(stats.average_rating.toFixed(1)) : 0,
      topPost,
    },
    posts,
  });
}
