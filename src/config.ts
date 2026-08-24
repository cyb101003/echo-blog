export const SITE = {
  url: "https://www.echobb.me",
  title: "Echo（陈宇博）— 个人技术博客",
  shortTitle: "Echo/",
  description: "Echo（陈宇博）的个人技术博客：15 岁 builder、元创岛联合创始人、Horizon AI 产品经理，记录项目、产品思考、文章与实验。",
  author: "Echo（陈宇博）",
  displayName: "Echo",
  realName: "陈宇博",
  age: 15,
  roles: [
    { organization: "元创岛", title: "联合创始人", label: "元创岛联合创始人", eyebrow: "CO-FOUNDER" },
    { organization: "Horizon AI", title: "产品经理", label: "Horizon AI 产品经理", eyebrow: "AI PRODUCT" }
  ],
  keywords: ["Echo", "陈宇博", "元创岛", "Horizon AI", "AI 产品经理", "15 岁 builder", "技术博客", "cyb101003"],
  github: "https://github.com/cyb101003",
  youtube: "https://www.youtube.com/@Echo-bb-1003",
  x: "https://x.com/Echo101003",
  zhihu: "https://www.zhihu.com/pin/2075244898685562899",
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
