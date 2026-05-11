CREATE TABLE dbo.users (
  id NVARCHAR(64) NOT NULL PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  username NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL CHECK (role IN ('creator', 'consumer')),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.sessions (
  token NVARCHAR(64) NOT NULL PRIMARY KEY,
  user_id NVARCHAR(64) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_sessions_users FOREIGN KEY (user_id)
    REFERENCES dbo.users(id) ON DELETE CASCADE
);

CREATE TABLE dbo.posts (
  id NVARCHAR(64) NOT NULL PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  caption NVARCHAR(MAX) NOT NULL,
  location NVARCHAR(255) NOT NULL,
  people_present NVARCHAR(MAX) NOT NULL DEFAULT '[]',
  image_url NVARCHAR(1000) NOT NULL,
  storage_path NVARCHAR(1000) NOT NULL,
  uploaded_by_id NVARCHAR(64) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_posts_users FOREIGN KEY (uploaded_by_id)
    REFERENCES dbo.users(id) ON DELETE CASCADE
);

CREATE TABLE dbo.comments (
  id NVARCHAR(64) NOT NULL PRIMARY KEY,
  text NVARCHAR(MAX) NOT NULL,
  post_id NVARCHAR(64) NOT NULL,
  user_id NVARCHAR(64) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_comments_posts FOREIGN KEY (post_id)
    REFERENCES dbo.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_users FOREIGN KEY (user_id)
    REFERENCES dbo.users(id) ON DELETE NO ACTION
);

CREATE TABLE dbo.ratings (
  id NVARCHAR(64) NOT NULL PRIMARY KEY,
  value INT NOT NULL CHECK (value BETWEEN 1 AND 5),
  post_id NVARCHAR(64) NOT NULL,
  user_id NVARCHAR(64) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_ratings_posts FOREIGN KEY (post_id)
    REFERENCES dbo.posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_users FOREIGN KEY (user_id)
    REFERENCES dbo.users(id) ON DELETE NO ACTION,
  CONSTRAINT uq_ratings_post_user UNIQUE (post_id, user_id)
);

CREATE INDEX idx_sessions_user_id ON dbo.sessions(user_id);
CREATE INDEX idx_posts_uploaded_by_id ON dbo.posts(uploaded_by_id);
CREATE INDEX idx_posts_created_at ON dbo.posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON dbo.comments(post_id);
CREATE INDEX idx_comments_user_id ON dbo.comments(user_id);
CREATE INDEX idx_ratings_post_id ON dbo.ratings(post_id);
CREATE INDEX idx_ratings_user_id ON dbo.ratings(user_id);
