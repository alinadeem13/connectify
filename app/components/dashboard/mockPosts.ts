// mockPosts.ts
export const mockPosts = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  title: `Post Title ${i + 1}`,
  caption: `This is caption for post ${i + 1}`,
  location: `City ${i + 1}`,
  people: ["Alice", "Bob"],
  comments: [
    { id: 1, author: "Maya", text: `Love the vibe in post ${i + 1}!` },
    { id: 2, author: "Noah", text: "This feels very Connectify." },
  ],
  image: `/images/post${(i % 5) + 1}.jpg`, // cycle 5 images
}));
