export const SITE = {
  title: "echo — 个人技术博客",
  shortTitle: "echo/",
  description: "15 岁开发者 echo 的项目、文章与实验记录。",
  author: "echo",
  age: 15,
  github: "https://github.com/cyb101003",
  youtube: "https://www.youtube.com/@Echo-bb-1003",
  x: "https://x.com/Echo101003",
  email: "",
  locale: "zh-CN"
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "首页", index: "01" },
  { href: "/projects/", label: "项目", index: "02" },
  { href: "/posts/", label: "文章", index: "03" },
  { href: "/archives/", label: "归档", index: "04" },
  { href: "/search/", label: "搜索", index: "05" }
] as const;
