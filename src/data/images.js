export const IMAGE_GROUPS = [
  { groupId: "candle", groupName: "蠟燭", images: [
    { id: "candle_001", file: "candle_001.png", label: "點火" },
    { id: "candle_002", file: "candle_002.png", label: "燃燒" },
    { id: "candle_003", file: "candle_003.png", label: "熄滅" },
  ]},
  { groupId: "cat_enjoy", groupName: "貓", images: [
    { id: "cat_enjoy_001", file: "cat_enjoy_001.png", label: "乾杯" },
    { id: "cat_enjoy_002", file: "cat_enjoy_002.png", label: "放風" },
    { id: "cat_enjoy_003", file: "cat_enjoy_003.png", label: "直播" },
  ]},
  { groupId: "dog_work", groupName: "狗", images: [
    { id: "dog_work_001", file: "dog_work_001.png", label: "祈禱" },
    { id: "dog_work_002", file: "dog_work_002.png", label: "煩躁" },
    { id: "dog_work_003", file: "dog_work_003.png", label: "爆炸" },
  ]},
  { groupId: "giraffe", groupName: "長頸鹿", images: [
    { id: "giraffe_001", file: "giraffe_001.png", label: "噴水" },
    { id: "giraffe_002", file: "giraffe_002.png", label: "澆花" },
    { id: "giraffe_003", file: "giraffe_003.png", label: "流涕" },
  ]},
  { groupId: "hedgehog", groupName: "刺蝟", images: [
    { id: "hedgehog_and_balloon_001", file: "hedgehog_and_balloon_001.png", label: "相遇" },
    { id: "hedgehog_and_balloon_002", file: "hedgehog_and_balloon_002.png", label: "衝撞" },
    { id: "hedgehog_and_balloon_003", file: "hedgehog_and_balloon_003.png", label: "破裂" },
  ]},
  { groupId: "love_or_not", groupName: "花", images: [
    { id: "love_or_not_001", file: "love_or_not_001.png", label: "呵護" },
    { id: "love_or_not_002", file: "love_or_not_002.png", label: "控制" },
    { id: "love_or_not_003", file: "love_or_not_003.png", label: "囚禁" },
  ]},
  { groupId: "robot_and_fish", groupName: "機器人", images: [
    { id: "robot_and_fish_001", file: "robot_and_fish_001.png", label: "相遇" },
    { id: "robot_and_fish_002", file: "robot_and_fish_002.png", label: "帶走" },
    { id: "robot_and_fish_003", file: "robot_and_fish_003.png", label: "送終" },
  ]},
];

export const ALL_IMAGES = IMAGE_GROUPS.flatMap((group) =>
  group.images.map((img) => ({
    ...img,
    groupId: group.groupId,
    groupName: group.groupName,
    src: `/images/${img.file}`,
  }))
);