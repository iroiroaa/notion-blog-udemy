import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export interface NotionAPi {
  allPosts: PageObjectResponse[] | PartialPageObjectResponse[];
}
