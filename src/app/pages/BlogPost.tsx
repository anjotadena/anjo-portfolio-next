import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { blogPosts } from "../data/portfolio-data";

export function BlogPost() {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Post not found</h1>
          <Link
            to="/blog"
            className="text-primary hover:opacity-80 flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={20} />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to blog
          </Link>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {post.readTime}
              </span>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-primary to-transparent mb-12" />

          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {post.excerpt}
            </p>

            <div className="bg-card border border-border rounded-xl p-8 my-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                This is a sample blog post. In a real implementation, you would load the
                full content from a markdown file or CMS. This demonstrates the layout and
                styling for blog posts in your portfolio.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Key Takeaways</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>Production-ready systems require careful planning and architecture</li>
              <li>Scalability should be considered from day one</li>
              <li>Performance optimization is an ongoing process</li>
              <li>Always measure and monitor your systems</li>
            </ul>

            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-xl p-8 my-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Code Example</h2>
              <pre className="bg-black/40 dark:bg-black/60 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-foreground">
{`// Example architecture pattern
const microservice = {
  async handleRequest(req) {
    // Validate input
    const data = await validate(req.body);
    
    // Process business logic
    const result = await processLogic(data);
    
    // Publish event
    await eventBus.publish('event.processed', result);
    
    return result;
  }
};`}
                </code>
              </pre>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Conclusion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Building production-ready systems is a journey of continuous learning and
              improvement. By focusing on solid architectural foundations, scalable
              patterns, and measurable outcomes, we can create systems that truly deliver
              value.
            </p>
          </article>
        </motion.div>
      </div>
    </div>
  );
}
