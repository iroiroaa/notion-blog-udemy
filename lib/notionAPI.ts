import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { start } from "repl";
import { NUMBER_OF_POSTGS_PER_PAGE } from "../constants/constants";
// config({ path: ".env.local" });
const notion = new Client({
  auth: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN : "",
});

const n2m = new NotionToMarkdown({ notionClient: notion });
export const getAllPosts = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID
      ? process.env.NOTION_DATABASE_ID
      : "",
    page_size: 100,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  const allPosts = posts.results;

  //   return allPosts;
  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};
const getPageMetaData = (post: any) => {
  const getTags = (tags: any) => {
    const allTags = tags.map((tag: any) => {
      return tag.name;
    });

    return allTags;
  };
  return {
    id: post.id,
    title: post.properties.Name.title[0].plain_text,
    description: post.properties.Description.rich_text[0].plain_text,
    date: post.properties.Date.date.start,
    slug: post.properties.Slug.rich_text[0].plain_text,
    tags: getTags(post.properties.Tags.multi_select),
  };
};

export const getSinglePost = async (slug: string) => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID
      ? process.env.NOTION_DATABASE_ID
      : "",
    filter: {
      property: "Slug",
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });

  const page = response.results[0];
  const metadata = getPageMetaData(page);
  //   console.log(metadata);
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(mdString, "mdstring");
  return {
    metadata,
    markdown: mdString,
  };
};

/* Topページ用記事の取得 */
export const getPostsForTopPage = async (pageSize: number) => {
  const allPosts = await getAllPosts();
  const fourPosts = allPosts.slice(0, pageSize);
  return fourPosts;
};

/* ページ番号に応じた記事取得　*/
export const getPostsByPage = async (page: number) => {
  const allPosts = await getAllPosts();

  const startIndex = (page - 1) * NUMBER_OF_POSTGS_PER_PAGE;
  const endIndex = startIndex + NUMBER_OF_POSTGS_PER_PAGE;

  return allPosts.slice(startIndex, endIndex);
};

export const getNumberOfPages = async () => {
  const allPosts = await getAllPosts();

  return (
    Math.floor(allPosts.length / NUMBER_OF_POSTGS_PER_PAGE) +
    (allPosts.length % NUMBER_OF_POSTGS_PER_PAGE > 0 ? 1 : 0)
  );
};

export const getPostsByTagAndPage = async (tagName: string, page: number) => {
  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) =>
    post.tags.find((tag: string) => tag === tagName)
  );
  const startIndex = (page - 1) * NUMBER_OF_POSTGS_PER_PAGE;
  const endIndex = startIndex + NUMBER_OF_POSTGS_PER_PAGE;

  return posts.slice(startIndex, endIndex);
};

export const getNumberOfPagesByTag = async (tagName: string) => {
  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) =>
    post.tags.find((tag: string) => tag === tagName)
  );

  return (
    Math.floor(posts.length / NUMBER_OF_POSTGS_PER_PAGE) +
    (posts.length % NUMBER_OF_POSTGS_PER_PAGE > 0 ? 1 : 0)
  );
};

export const getAllTags = async () => {
  const allPosts = await getAllPosts();

  const allTagsDuplicationLists = allPosts.flatMap((post) => post.tags);
  const set = new Set(allTagsDuplicationLists);

  const allTagsList = Array.from(set);
  return allTagsList;

  //flatMap()은 매핑된 각 요소 배열들을 평탄화 하여 하나의 배열로 만들어줌
  // Set은 객체를 만들어주는데 중복을 배제 시킴
  // Array.form으로 다시 배열로 만들어줌
};

// 10/4 = 2  2+    (10%4) = 3

// import { Client } from "@notionhq/client";
// import {
//   PageObjectResponse,
//   PartialPageObjectResponse,
// } from "@notionhq/client/build/src/api-endpoints";

// const notion = new Client({
//   auth: "secret_kOOGcDyOwquTWk956mOkKD5pc3JGKIY1BPPcn7s7mPo",
// });

// export const getAllPosts = async (): Promise<
//   PageObjectResponse[] | PartialPageObjectResponse[]
// > => {
//   const posts = await notion.databases.query({
//     database_id: "82c3aecc0a894fc0978208ca25b82554",
//     page_size: 100,
//   });

//   const allPosts = posts.results;

//   return allPosts;
// };
