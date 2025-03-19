export type Site = {
  NAME: string;
  DESC: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_WORKS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
};

export type Metadata = {
  TITLE: string;
  DESCRIPTION: string;
};

export type Social = {
  NAME: string;
  HREF: string;
  ICON: string;
  ENABLE?: boolean;
};

export type Socials = Social[];
