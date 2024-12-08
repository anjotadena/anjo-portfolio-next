import { GraphQLClient, gql } from "graphql-request";

export interface ArticleNode {
  title: string;
  brief: string;
  url: string;
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
          }
        }
      }
    }
  }
`;

export async function fetchArticles(): Promise<PostEdge[]> {
  const client = new GraphQLClient(API_URL);
  const response = (await client.request(QUERY)) as ApiResponse;

  return response.publication.posts.edges;
}
const Blog = async () => {
  const articles = await fetchArticles();

  return (
    <div className="min-h-[85vh]">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          My Hashnode Articles
        </h1>
        <div className="flex flex-col">
          {articles.map(({ node }, index) => (
            <>
              <div key={index} className="bg-white p-4">
                <h2 className="text-xl font-semibold mb-2">{node.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{node.brief}</p>
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
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
