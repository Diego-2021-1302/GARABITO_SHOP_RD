import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen } from 'lucide-react';
import SEO from '../components/common/SEO';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // En el futuro: const { data: post } = usePost(slug);
  const post = null; 

  if (!post) {
    return (
      <div className="container-custom py-40 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Artículo no encontrado</h2>
        <Link to="/blog" className="text-brand-primary font-bold hover:underline flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Volver al blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <SEO title={post.title} description={post.excerpt} />
      <div className="container-custom max-w-4xl">
        {/* Contenido del post aquí */}
      </div>
    </div>
  );
};

export default BlogDetail;
