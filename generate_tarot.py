# -*- coding: utf-8 -*-
import json
import random

# Major Arcana (0-20)
major_arcana = [
    {"id": 0, "name": "The Fool", "nameCn": "愚人", "keywords": ["新开始", "纯真", "自发性", "自由"],
     "meaning": "愚人象征着全新的开始和无限的可能性。他站在悬崖边缘，准备跃入未知。",
     "love": "新的恋情可能即将到来。敞开心扉迎接意想不到的相遇。",
     "career": "在事业上大胆冒险吧！一个新的机会正在等待着你。",
     "health": "你的身体正在准备迎接更新。开始新的健康习惯的好时机。",
     "spirituality": "一场精神觉醒正在开始。放下恐惧，拥抱未知。",
     "affirmation": "我相信旅程，即使我看不到目的地。",
     "actionSteps": ["做一件让你感到害怕但渴望做的事情", "写下你对未来的梦想", "对某件事说\"好\""],
     "shareText": "今日塔罗 | 愚人牌出现了...你准备好踏出那一步了吗？",
     "shareHashtags": "#Tarot #TheFool #NewBeginnings #WishingMoon"},
    
    {"id": 1, "name": "The Magician", "nameCn": "魔术师", "keywords": ["显化", "创造力", "资源", "意志力"],
     "meaning": "魔术师拥有实现梦想所需的一切工具。无限创造力在你掌控之中。",
     "love": "你拥有创造理想爱情所需的一切。运用你的创造力来吸引伴侣。",
     "career": "你的技能和资源正为成功而对齐。现在是采取大胆行动的时刻。",
     "health": "你有能力显化更好的健康状态。相信你内在的疗愈力量。",
     "spirituality": "你与无限的创造力相连。你就是自己命运的魔法师。",
     "affirmation": "我拥有一切所需来显化我的愿望。",
     "actionSteps": ["写下你最深的一个渴望", "立即采取一个具体步骤", "可视化你达成目标时的感受"],
     "shareText": "今日塔罗 | 魔术师出现了！你现在拥有实现梦想的全部工具！",
     "shareHashtags": "#Tarot #Magician #Manifestation #WishingMoon"},
    
    {"id": 2, "name": "The High Priestess", "nameCn": "女祭司", "keywords": ["直觉", "神圣知识", "女性能量", "神秘"],
     "meaning": "女祭司提醒你：真正的智慧来自内心。答案就在你的内心深处。",
     "love": "相信你对爱情的直觉。你内心深处的智慧知道你真正需要什么。",
     "career": "超越表面信息来看待问题。相信你的第一直觉和本能反应。",
     "health": "关注你身体微妙的信号。注意那些看似微小但持续的直觉警告。",
     "spirituality": "一个深层的精神下载即将到来。保持安静，倾听你内在的智慧。",
     "affirmation": "我相信我的直觉，尊重我内在的智慧。",
     "actionSteps": ["今天静坐10分钟向内探索", "记录任何浮现的感觉或意象", "相信你的第一反应"],
     "shareText": "今日塔罗 | 女祭司在呼唤你——是时候相信你的直觉了！",
     "shareHashtags": "#Tarot #HighPriestess #Intuition #WishingMoon"},
    
    {"id": 3, "name": "The Empress", "nameCn": "女皇", "keywords": ["女性能量", "美丽", "自然", "富足", "母性"],
     "meaning": "女皇是富足和生命力的化身。你值得被爱，被滋养，被美好包围。",
     "love": "关系中充满了滋养和情感充实。美丽和浪漫被特别突出。",
     "career": "你的创意项目正在蓬勃发展。富足正自然地流向你的创意产出。",
     "health": "用爱来滋养你的身体。适合开始护肤、瑜伽或滋养型的健康习惯。",
     "spirituality": "连接神圣女性能量。大自然为你准备了神圣的疗愈智慧。",
     "affirmation": "我是创造力、美丽和丰盛之爱的容器。",
     "actionSteps": ["今天在大自然中度过至少30分钟", "创造一样美丽的东西", "用爱和善意对待你的身体"],
     "shareText": "今日塔罗 | 女皇能量正在闪耀！是时候拥抱你创造性的、滋养的力量了！",
     "shareHashtags": "#Tarot #Empress #Abundance #WishingMoon"},
    
    {"id": 4, "name": "The Emperor", "nameCn": "皇帝", "keywords": ["权威", "结构", "控制", "父亲般的力量", "稳定"],
     "meaning": "皇帝提醒你：真正的力量来自于自律和清晰的边界。",
     "love": "在关系中建立健康的边界。结构、承诺会加强你们的纽带。",
     "career": "掌控你的职业生活。纪律和策略将带来成功。",
     "health": "为你的健康养生方案建立结构。习惯上的自律会带来活力。",
     "spirituality": "建立有纪律的精神修行。每天固定时间的冥想会带来巨大益处。",
     "affirmation": "我是生活的建筑师，用智慧和力量建造一切。",
     "actionSteps": ["设定一个明确、可实现的目标", "制定具体的行动计划", "在某个关系中设立健康的边界"],
     "shareText": "今日塔罗 | 皇帝说：是时候站起来，展现你的权威，建立真正持久的东西了！",
     "shareHashtags": "#Tarot #Emperor #Authority #WishingMoon"},
    
    {"id": 5, "name": "The Hierophant", "nameCn": "教皇", "keywords": ["精神智慧", "传统", "教育", "信仰"],
     "meaning": "有时候，向有智慧的人学习是正确的选择。尊重传统，但也要勇于突破限制。",
     "love": "向可信赖的人寻求关于爱情关系的建议。传统价值观可能会支持你们的结合。",
     "career": "教育或证书可能会推动你的职业发展。适合进修学习。",
     "health": "将传统疗法与现代医学结合可能会有帮助。",
     "spirituality": "一位精神导师或社群正在进入你的生活。",
     "affirmation": "我尊敬走在前面的人们的智慧。",
     "actionSteps": ["今天寻求一位导师或长辈的建议", "学习一些与你精神修行相关的知识", "重新连接你童年时期有意义的精神实践"],
     "shareText": "今日塔罗 | 教皇出现了！一位有智慧的人即将进入你的生活或给你指导！",
     "shareHashtags": "#Tarot #Hierophant #Wisdom #WishingMoon"},
    
    {"id": 6, "name": "The Lovers", "nameCn": "恋人", "keywords": ["爱情", "和谐", "关系", "选择", "一致性"],
     "meaning": "恋人牌代表了一个需要在诚实和完整的基础上做出的重大人生选择。",
     "love": "一个关于爱情的重要选择在等待着你。跟随你内心最深处真相。",
     "career": "一个涉及伙伴关系或价值观的关键决定即将到来。",
     "health": "你的情感和身体健康在当下深度相连。",
     "spirituality": "你的灵魂正在被召唤，让外在生活与内在价值观保持一致。",
     "affirmation": "我选择爱，爱也会选择我。",
     "actionSteps": ["今天做一个与你的真实价值观一致的选择", "对你爱的人说一句真心话", "思考：哪些选择需要更大的诚实？"],
     "shareText": "今日塔罗 | 恋人牌对你的爱情生活来说意味深长！重大的选择能量！",
     "shareHashtags": "#Tarot #Lovers #Love #WishingMoon"},
    
    {"id": 7, "name": "The Chariot", "nameCn": "战车", "keywords": ["意志力", "决心", "控制", "胜利", "征服"],
     "meaning": "没有什么能阻挡一个目标明确的你！对立的力能被你整合并向前推进。",
     "love": "用你的决心来克服关系中的挑战。胜利属于那些不放弃的人。",
     "career": "你的专注和动力将带来胜利。保持对你目标的承诺。",
     "health": "将你的战士能量引导到健身中。战胜惰性后等待你的是胜利。",
     "spirituality": "平衡你内在的对立力量。整合带来精神上的胜利。",
     "affirmation": "我是专注的、坚定的，胜利属于我。",
     "actionSteps": ["确定一个阻碍你的障碍，承诺用意志力克服它", "平衡你生活中两个对立的需求", "采取果断的行动"],
     "shareText": "今日塔罗 | 战车正在驱动你走向胜利！当你如此专注时，没有什么能阻挡你！",
     "shareHashtags": "#Tarot #Chariot #Victory #WishingMoon"},
    
    {"id": 8, "name": "Strength", "nameCn": "力量", "keywords": ["内在力量", "勇气", "慈悲", "影响力"],
     "meaning": "这不是关于 brute force 的力量，而是关于内在的、温柔的力量——用爱和慈悲征服一切。",
     "love": "爱情中真正的力量来自慈悲，而非控制。学习温和地坚定。",
     "career": "你的影响力和说服能力是你的超超能力。明智地使用它们。",
     "health": "以勇气面对健康挑战。温和的力量，而非蛮力，带来真正的疗愈。",
     "spirituality": "你寻求的力量就在你内心。相信你内在的狮子。",
     "affirmation": "我有面对一切的勇气和慈悲。",
     "actionSteps": ["今天用温和的勇气处理一个恐惧", "对某个人表达慈悲", "练习一种让你感觉强大的运动"],
     "shareText": "今日塔罗 | 力量牌能量：你比你想象的更勇敢！温柔的力量，而非强硬！",
     "shareHashtags": "#Tarot #Strength #Courage #WishingMoon"},
    
    {"id": 9, "name": "The Hermit", "nameCn": "隐士", "keywords": ["内省", "内向", "内在指引", "独处"],
     "meaning": "有时候，答案只能在安静中找到。你不需要逃避世界，只需向内探寻。",
     "love": "有时候独处会引领你找到你寻求的爱。先了解自己，再寻找伴侣。",
     "career": "从噪音中退一步。你最重要的见解在静止中到来。",
     "health": "休息和独处可能是现在最好的药。尊重你对独处的需求。",
     "spirituality": "一段深层内在工作的时期已经开始。你的内在之光会指引你。",
     "affirmation": "在独处中，我找到了我寻求的指引。",
     "actionSteps": ["今天有意识地花时间独处反思", "减少社交媒体的使用", "写下你对自己的新认识"],
     "shareText": "今日塔罗 | 隐士在召唤你向内...有时候，最重要的旅程是内心的旅程！",
     "shareHashtags": "#Tarot #Hermit #Introspection #WishingMoon"},
    
    {"id": 10, "name": "Wheel of Fortune", "nameCn": "命运之轮", "keywords": ["好运", "业力", "生命周期", "命运", "转机"],
     "meaning": "生命的循环永不停息，改变是唯一不变的。信任命运之轮的转动。",
     "love": "命运之轮正在为你转动，爱情将开启新的篇章。",
     "career": "变化正在进行中。拥抱起伏——幸运在你这边。",
     "health": "影响你健康的周期性变化正在发生。信任更新和转变的过程。",
     "spirituality": "你的命运正在完美地展开。业力正在发挥作用。",
     "affirmation": "我欢迎命运之轮带来的变化。",
     "actionSteps": ["放下对特定结果的执着", "拥抱一个意想不到的变化", "思考：你在等待什么样的运气？"],
     "shareText": "今日塔罗 | 命运之轮正在旋转！重大变化即将到来——你准备好乘风破浪了吗？",
     "shareHashtags": "#Tarot #WheelOfFortune #Destiny #WishingMoon"},
    
    {"id": 11, "name": "Justice", "nameCn": "正义", "keywords": ["公平", "真理", "法律", "业力", "因果"],
     "meaning": "真相终将大白，你的每一个行为都有后果。公正无偏地看待一切。",
     "love": "真相和公平在你们的关系中是必不可少的。业力正在发挥作用。",
     "career": "诚实的经营带来成功。你正直的声誉会为你打开大门。",
     "health": "寻求平衡、整体的健康方法。关于你身体的真相正在显现。",
     "spirituality": "业力是精确的。你的行为向外的涟漪最终会回到你身上。",
     "affirmation": "我用正直行事，相信真理终将胜出。",
     "actionSteps": ["今天做一个完全诚实、即使困难的决定", "为你过去的一个错误道歉", "评估你生活中的平衡"],
     "shareText": "今日塔罗 | 正义说：你付出的正在回到你身上。真相是不可妥协的！",
     "shareHashtags": "#Tarot #Justice #Karma #WishingMoon"},
    
    {"id": 12, "name": "The Hanged Man", "nameCn": "倒吊人", "keywords": ["暂停", "臣服", "新视角", "放下", "牺牲"],
     "meaning": "有时候，放弃控制就是获得答案的方式。从不同的角度看世界。",
     "love": "放弃对情况的控制需要勇气，但新的视角会改变一切。",
     "career": "现在暂停会导致重大突破。自愿的牺牲会带来长期收益。",
     "health": "改变你看健康挑战的方式。旧习惯的暂停带来疗愈。",
     "spirituality": "自愿的牺牲加速你的精神进化。放下才能得到。",
     "affirmation": "通过放下，我获得了对一切的新视角。",
     "actionSteps": ["今天故意做一件不同的事", "放弃一个你一直紧握着控制权的事情", "用不同的方式看待一个你纠结很久的问题"],
     "shareText": "今日塔罗 | 倒吊人说：如果放下就是答案呢？有时候暂停就是突破！",
     "shareHashtags": "#Tarot #HangedMan #LetGo #WishingMoon"},
    
    {"id": 13, "name": "Death", "nameCn": "死神", "keywords": ["结束", "转变", "过渡", "蜕变", "释放"],
     "meaning": "不要害怕——这是蜕变，不是毁灭。旧的必须死去，新的才能诞生。",
     "love": "你爱情生活的一个旧篇章正在结束。蜕变通向更好的东西。",
     "career": "一个重大的结束为新的职业开始扫清道路。拥抱它。",
     "health": "旧模式的死亡带来更新的健康。细胞层面的转变正在发生。",
     "spirituality": "死亡不是终结，而是蜕变。释放才能重生。",
     "affirmation": "我释放不再为我服务的东西，欢迎蜕变。",
     "actionSteps": ["确定一件你需要放下的事情，有意识地释放它", "接受一个结束，不要抵抗", "为即将到来的新开始腾出空间"],
     "shareText": "今日塔罗 | 死神牌并不像听起来那么可怕！它实际上是关于美丽的蜕变和新开始！",
     "shareHashtags": "#Tarot #Death #Transformation #WishingMoon"},
    
    {"id": 14, "name": "Temperance", "nameCn": "节制", "keywords": ["平衡", "适度", "耐心", "目标", "意义"],
     "meaning": "平衡是通往持久成功的道路。在极端之间取得平衡。",
     "love": "平衡是你们关系中的关键。适度和耐心会加强纽带。",
     "career": "在职业挑战中找到中间道路。平衡野心与耐心。",
     "health": "万事适度支持疗愈。运动与休息平衡。",
     "spirituality": "你的道路是整合与和谐的道路。平衡你内在的极端。",
     "affirmation": "我在一切极端之中找到平衡与和平。",
     "actionSteps": ["平衡你生活中的一个领域", "练习适度和耐心", "找一个让你感到平静的活动"],
     "shareText": "今日塔罗 | 节制在呼唤你找到平衡！耐心和适度是你现在的超能力！",
     "shareHashtags": "#Tarot #Temperance #Balance #WishingMoon"},
    
    {"id": 15, "name": "The Devil", "nameCn": "恶魔", "keywords": ["阴影自我", "执着", "成瘾", "物质主义", "束缚"],
     "meaning": "这张牌在问：你被什么束缚了？你选择的枷锁，还是真正的自由？",
     "love": "审视那些在爱情中束缚你的执着。真正的自由来自内心。",
     "career": "注意物质主义陷阱或有毒的工作环境。你比你想象的更有力量。",
     "health": "成瘾模式可能正在影响你的健康。打破自我强加的枷锁。",
     "spirituality": "用勇气面对你的阴影自我。阴影不是坏的——它只是被你否认的部分自己。",
     "affirmation": "我从一个不再为我最高利益服务的枷锁中解放出来。",
     "actionSteps": ["确定一个限制你的执着，采取一个步骤走向自由", "注意你生活中的\"必须\"和\"应该\"", "承认并整合一个你一直否认的阴影特质"],
     "shareText": "今日塔罗 | 恶魔牌正在向你展示你感到被困的地方...走向自由的第一步是觉知！",
     "shareHashtags": "#Tarot #Devil #Shadow #WishingMoon"},
    
    {"id": 16, "name": "The Tower", "nameCn": "塔", "keywords": ["突然变化", "动荡", "启示", "觉醒", "混沌"],
     "meaning": "虚假的基础必须被摧毁，才能建立真正的根基。这是解放，不是毁灭。",
     "love": "一个突然的启示可能动摇你们的关系。崩塌的东西是建立在沙滩上的。",
     "career": "意想不到的动荡可能很痛苦，但最终是解放的。",
     "health": "一个突然的健康意识促使必要的改变。崩溃导致突破。",
     "spirituality": "一场剧烈的觉醒正在发生。虚假结构的破坏揭示了真相。",
     "affirmation": "我欢迎永远不属于我的东西的崩塌。",
     "actionSteps": ["允许变化发生，不要抗拒", "注意突然出现的\"打破\"或\"结束\"", "在动荡中保持冷静"],
     "shareText": "今日塔罗 | 塔正在震动一切！有时候一切必须崩塌，才能重建更好的东西！",
     "shareHashtags": "#Tarot #Tower #Chaos #WishingMoon"},
    
    {"id": 17, "name": "The Star", "nameCn": "星星", "keywords": ["希望", "信念", "目标", "更新", "灵感"],
     "meaning": "在风暴之后，星星终于出现了。希望和灵感是你的北极星。",
     "love": "动荡之后是疗愈。对爱情的希望和信念是你的北极星。",
     "career": "灵感现在自由流动。你的创意天赋可以疗愈和帮助很多人。",
     "health": "疗愈之水正在流向你。更新你对活力的健康的希望。",
     "spirituality": "你与神圣的联系很强。相信你内在的星星指引你。",
     "affirmation": "我充满希望，被我内心的光芒指引。",
     "actionSteps": ["将你的能量投入一个充满希望、创造性的项目", "写下你感激的三件事", "仰望星空"],
     "shareText": "今日塔罗 | 在风暴之后是星星！希望是你的超能力！保持信念！",
     "shareHashtags": "#Tarot #Star #Hope #WishingMoon"},
    
    {"id": 18, "name": "The Moon", "nameCn": "月亮", "keywords": ["幻觉", "恐惧", "焦虑", "潜意识", "直觉"],
     "meaning": "相信你的直觉，即使路看起来很模糊。一切都不像表面那样。",
     "love": "隐藏的情绪可能正在浮出水面。信任直觉而非恐惧。",
     "career": "事情可能不像表面上看到的那样。在做出重大决定之前多方求证。",
     "health": "恐惧型思维可能正在影响你的健康。关注睡眠质量。",
     "spirituality": "潜意识正在揭示深刻的真理。信任梦境和内心意象。",
     "affirmation": "我通过内心的光芒克服恐惧。",
     "actionSteps": ["写下任何恐惧或焦虑，不带评判地命名你真正感受到的", "今晚关注你的梦境", "当你怀疑时，选择信任你的直觉"],
     "shareText": "今日塔罗 | 月亮在问你：当事情感觉不确定时，是否信任你的直觉...你的直觉知道真相！",
     "shareHashtags": "#Tarot #Moon #Intuition #WishingMoon"},
    
    {"id": 19, "name": "The Sun", "nameCn": "太阳", "keywords": ["积极", "成功", "活力", "快乐", "自由"],
     "meaning": "太阳是最乐观的牌——纯粹的快乐、成功和活力在你的生活中流淌。",
     "love": "纯粹的快乐和活力涌入你的关系。一段幸福和温暖的时间。",
     "career": "成功和认可正在照耀你。你的活力吸引机会。",
     "health": "出色的健康能量流过你。更新活力和乐观的时期。",
     "spirituality": "你的精神被照亮。快乐是你的与生俱来的权利。",
     "affirmation": "我沐浴在我自己放射出的喜悦和成功的温暖中。",
     "actionSteps": ["今天做一件真正让你快乐的事——不带内疚", "在阳光下度过时间", "向世界展示你最好的自我"],
     "shareText": "今日塔罗 | 太阳正在照耀你！前方只有好能量——快乐、成功和纯粹的活力！",
     "shareHashtags": "#Tarot #Sun #Joy #WishingMoon"},
    
    {"id": 20, "name": "Judgement", "nameCn": "审判", "keywords": ["审判", "重生", "内在召唤", "赦免", "更新"],
     "meaning": "你被召唤清算过去、迎接新生。这是灵魂被呼唤的时刻。",
     "love": "被召唤用慈悲来评估你的爱情生活。关系价值观的重生机会。",
     "career": "你过去的工作正在被认可。一个职业重生或召唤正在出现。",
     "health": "你的身体正在呼唤完全的更新。回应内心的觉醒。",
     "spirituality": "你被召唤成为更高版本的自己。回应号角。",
     "affirmation": "我回应召唤，重生为我最高的自我。",
     "actionSteps": ["反思过去的一个决定，原谅自己任何残留的内心谴责", "回应一个一直在呼唤你内心的冲动", "考虑忏悔或赦免——给自己或他人的礼物"],
     "shareText": "今日塔罗 | 审判牌在召唤你崛起！是时候回应你更高的召唤，放下过去了！",
     "shareHashtags": "#Tarot #Judgement #Rebirth #WishingMoon"},
    
    {"id": 21, "name": "The World", "nameCn": "世界", "keywords": ["完成", "整合", "成就", "旅行", "庆祝"],
     "meaning": "你已经到达终点，准备好重新开始。轮回了。",
     "love": "一个重大的爱情循环正在美丽地完成。整合和庆祝等待着你。",
     "career": "你已经完成了你着手做的事情。新的成长循环开始。",
     "health": "完全的整合和幸福是你的。身体庆祝它的完整。",
     "spirituality": "一个深刻的精神循环的完成。你现在是完整的——开始下一个循环。",
     "affirmation": "我庆祝这个周期的完成，欢迎新的开始。",
     "actionSteps": ["承认一个重大成就，花点时间真正庆祝它", "整合你从整个周期中学到的教训", "为下一个循环设定意图"],
     "shareText": "今日塔罗 | 世界牌——你正处于一个准备庆祝的周期结尾！完成能量爆棚！",
     "shareHashtags": "#Tarot #World #Completion #WishingMoon"}
]

# Generate Minor Arcana
suits = [
    {"suit": "wands", "nameCn": "权杖", "ids": list(range(22, 36))},
    {"suit": "cups", "nameCn": "圣杯", "ids": list(range(36, 50))},
    {"suit": "swords", "nameCn": "宝剑", "ids": list(range(50, 64))},
    {"suit": "pentacles", "nameCn": "星币", "ids": list(range(64, 78))}
]

ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"]
ranks_cn = {"Ace": "Ace", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10", "Page": "侍从", "Knight": "骑士", "Queen": "皇后", "King": "国王"}

suit_keywords = {
    "wands": ["创造力", "热情", "灵感", "行动"],
    "cups": ["情感", "爱情", "直觉", "创意"],
    "swords": ["心智", "沟通", "冲突", "真相"],
    "pentacles": ["物质", "金钱", "工作", "安全"]
}

minor_arcana = []
for suit_data in suits:
    suit = suit_data["suit"]
    nameCn = suit_data["nameCn"]
    for i, rank in enumerate(ranks):
        card_id = list(suit_data["ids"])[i]
        name = f"{rank} of {suit_data['suit'].capitalize()}s" if rank != "Ace" else f"Ace of {suit_data['suit'].capitalize()}s"
        card = {
            "id": card_id,
            "name": name,
            "nameCn": f"{ranks_cn[rank]}{nameCn}",
            "keywords": suit_keywords[suit] + [rank] if rank != "Ace" else suit_keywords[suit],
            "meaning": f"{nameCn}代表{suit_keywords[suit][0]}和{suit_keywords[suit][1]}的能量。",
            "love": f"{suit_keywords[suit][0]}能量在爱情中流动，{suit_keywords[suit][2]}的连接正在发展。",
            "career": f"你的{suit_keywords[suit][0]}正在推动职业发展，{suit_keywords[suit][3]}是关键词。",
            "health": f"关注你的{suit_keywords[suit][0]}能量，身体正在平衡。",
            "spirituality": f"精神上的{suit_keywords[suit][0]}正在觉醒，灵性成长在等待你。",
            "affirmation": f"我拥抱{suit_keywords[suit][0]}的能量，让它指引我前进。",
            "actionSteps": [f"采取一个与{suit_keywords[suit][0]}相关的行动", "连接你的直觉", "信任过程"],
            "shareText": f"今日塔罗 | {ranks_cn[rank]}{nameCn}为你带来{suit_keywords[suit][0]}的能量！",
            "shareHashtags": f"#Tarot #{rank}Of{suit.capitalize()}s #WishingMoon"
        }
        minor_arcana.append(card)

# Combine all cards
all_cards = major_arcana + minor_arcana

# Write to file
with open('tarot-cards.json', 'w', encoding='utf-8') as f:
    json.dump(all_cards, f, ensure_ascii=False, indent=2)

print(f"Generated {len(all_cards)} cards")
