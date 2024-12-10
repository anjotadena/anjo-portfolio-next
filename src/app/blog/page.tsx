import { GraphQLClient, gql } from "graphql-request";

export interface ArticleNode {
  title: string;
  brief: string;
  url: string;
  publishedAt: string;
}

export interface PostEdge {
  node: ArticleNode;
}

export interface Posts {
  edges: PostEdge[];
}

export interface Publication {
  isTeam: boolean;
  title: string;
  posts: Posts;
}

export interface ApiResponse {
  publication: Publication;
}

const API_URL = "https://gql.hashnode.com";

const QUERY = gql`
  query Publication {
    publication(host: "anjotadena.hashnode.dev") {
      isTeam
      title
      posts(first: 10) {
        edges {
          node {
            title
            brief
            url
            publishedAt
          }
        }
      }
    }
  }
`;

async function fetchArticles(): Promise<PostEdge[]> {
  const client = new GraphQLClient(API_URL);
  const response = (await client.request(QUERY)) as ApiResponse;

  return response.publication.posts.edges;
}
const Blog = async () => {
  const articles = await fetchArticles();
  
  return (
    <div className="min-h-[85vh]">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">
          My Articles
        </h1>
        <div className="flex flex-col">
          {articles.map(({ node }, index) => (
            <>
              <div key={index} className="bg-white p-4 dark:bg-transparent">
                <h2 className="text-xl font-semibold mb-2">{node.title}</h2>
                <h5 className="text-sm text-gray-500 dark:text-gray-300 mb-2">Published: {node.publishedAt}</h5>
                <p className="text-gray-600 text-sm mb-4 dark:text-gray-200">{node.brief}</p>
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-gray-400"
                >
                  Read More →
                </a>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
