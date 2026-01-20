import Image from "next/image";
import Link from "next/link";

export interface BlogPostProps {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  postType: 'article' | 'clip';
}

export function BlogPost({ slug, title, excerpt, imageUrl }: BlogPostProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <Link href={`/blog/${slug}`}>
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={title}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-700 mb-4">{excerpt}</p>
          <span className="text-blue-500 hover:underline">Read More</span>
        </div>
      </Link>
    </div>
  );
}
