import { useEffect, useState } from "react";
import "./styles.css";

type Post = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
};

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedTag, setSelectedTag] = useState("все");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://dummyjson.com/posts?limit=10&skip=0"
        );

        if (!response.ok) {
          throw new Error("не удалось загрузить новости");
        }

        const data = await response.json();

        setPosts(data.posts);
        setTotal(data.total);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "произошла ошибка"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const loadMore = async () => {
    if (loadingMore || posts.length >= total) return;

    try {
      setLoadingMore(true);
      setError("");

      const response = await fetch(
        `https://dummyjson.com/posts?limit=10&skip=${posts.length}`
      );

      if (!response.ok) {
        throw new Error("не удалось загрузить следующие посты");
      }

      const data = await response.json();

      setPosts((previousPosts) => [
        ...previousPosts,
        ...data.posts,
      ]);

      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "произошла ошибка"
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const tags = [
    "все",
    ...new Set(posts.flatMap((post) => post.tags)),
  ];

  const filteredPosts =
    selectedTag === "все"
      ? posts
      : posts.filter((post) =>
          post.tags.includes(selectedTag)
        );

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">NEWS<span>FEED</span></div>
          <p>новости, мнения и интересные публикации</p>
        </div>
      </header>

      <main className="container">
        <div className="section-heading">
          <div>
            <h1>лента новостей</h1>
            <p>читайте последние публикации</p>
          </div>

          <div className="post-count">
            {posts.length} / {total} постов
          </div>
        </div>

        <div className="filter">
          <label htmlFor="tag-filter">фильтр по тегу:</label>

          <select
            id="tag-filter"
            value={selectedTag}
            onChange={(event) =>
              setSelectedTag(event.target.value)
            }
          >
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "Все" ? "Все теги" : `#${tag}`}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="status">
            <div className="spinner"></div>
            <p>загружаем новости...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={() => window.location.reload()}
            >
              обновить страницу
            </button>
          </div>
        )}

        {!loading && !error && filteredPosts.length === 0 && (
          <div className="status">
            <p>новостей с таким тегом нет</p>
          </div>
        )}

        {!loading && (
          <div className="news-list">
            {filteredPosts.map((post) => (
              <article className="news-card" key={post.id}>
                <div className="news-top">
                  <span className="news-label">
                    новость #{post.id}
                  </span>
                  <span className="news-dot">●</span>
                </div>

                <h2>{post.title}</h2>

                <p className="news-body">{post.body}</p>

                <div className="tags">
                  {post.tags.map((tag) => (
                    <button
                      className={`tag ${
                        selectedTag === tag ? "active" : ""
                      }`}
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <div className="news-footer">
                  <div className="reactions">
                    <span title="Лайки">
                      👍 {post.reactions.likes}
                    </span>
                    <span title="Дизлайки">
                      👎 {post.reactions.dislikes}
                    </span>
                  </div>

                  <span className="post-id">
                    Пост номер {post.id}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && posts.length < total && (
          <div className="load-more">
            <button
              className="load-button"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore
                ? "Загрузка..."
                : "Загрузить ещё 10 постов"}
            </button>
          </div>
        )}

        {!loading && posts.length >= total && posts.length > 0 && (
          <p className="end-message">
            вы просмотрели все загруженные новости
          </p>
        )}
      </main>

      <footer className="footer">
        News Feed · Данные предоставлены DummyJSON API
      </footer>
    </div>
  );
}

export default App;
