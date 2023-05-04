import React from "react";
import { getAllPosts, getSinglePost } from "../../lib/notionAPI";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Link from "next/link";
export const getStaticPaths = async () => {
  const allposts = await getAllPosts();
  const paths = allposts.map(({ slug }): any => ({ params: { slug } }));
  return {
    paths,
    fallback: "blocking", //fallback이 blocking으로 설정되어 있으므로, 요청된 페이지가 미리 빌드되어 있지 않은 경우, 서버에서 페이지를 빌드하기 위해 대기하게 됩니다. 이를 통해 항상 빠른 응답 시간을 보장할 수 있습니다.
  };
};
export const getStaticProps = async ({ params }: any) => {
  const post = await getSinglePost(params.slug);
  return {
    props: {
      post,
    },
    revalidate: 60, //60초마다 재갱신한다는 의미 ssg도 하면서 60초마다 새로운 내용으로 갱신해간다는 것이 ISA라는 의미가 된다
  };
};

function post({ post }: any) {
  return (
    <section className="container lg:px-2 px-5 h-screen lg:w-2/5 mx-auto mt-20">
      <h2 className="w-full text-2xl font-medium">{post.metadata.title}</h2>
      <div className="border-b-2 w-1/3 mt-1 border-sky-900"></div>
      <span className="text-gray-500">posted date at {post.metadata.date}</span>
      <br />
      {post.metadata.tags.map((tag: string, index: number) => (
        <p
          className="text-white bg-sky-900 rounded-xl font-medium mt-2 px-2 inline-block mr-2"
          key={index}
        >
          <Link href={`/posts/tag/${tag}/page/1`}>{tag}</Link>
        </p>
      ))}

      <div className="mt-10 font-medium">
        <ReactMarkdown
          children={post.markdown}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, "")}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
          }}
        />
        <Link href="/">
          <span className="pb-20 block mt-3 text-sky-900">ホームに戻る</span>
        </Link>
      </div>
    </section>
  );
}

export default post;
