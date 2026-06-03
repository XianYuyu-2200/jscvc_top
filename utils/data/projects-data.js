export const projectsData = [
    {
        id: 1,
        name: '步兵机器人系统',
        description: "步兵机器人是场上最核心的稳定输出单位，需要兼顾机动、射击精度、散热、维护和抗干扰。我们关注底盘运动控制、云台响应、发射机构稳定性、装甲板识别和实车联调，让机器人在长时间对抗中保持可靠。",
        tools: ['C++', 'Python', 'OpenCV', 'Git', 'Linux', 'Docker', 'Matlab', 'Nginx'],
        role: '机械 / 电控 / 视觉协同',
        code: 'https://github.com/robomaster',
        demo: 'https://www.robomaster.com/zh-CN',
    },
    {
        id: 2,
        name: '视觉自瞄与目标识别',
        description: '视觉系统负责相机标定、装甲板检测、目标跟踪、弹道补偿和延迟评估。真正的难点不是单次识别成功，而是在光照变化、机器人运动、网络延迟和赛场干扰下持续稳定输出可用目标。',
        tools: ['Python', 'OpenCV', "Pytorch", "Tensorflow", "C++", "Git", "Linux", "Docker"],
        role: '视觉算法 / 实车测试',
        code: 'https://github.com/robomaster',
        demo: 'https://www.robomaster.com/en-US/robo/overview',
    },
    {
        id: 3,
        name: '哨兵与雷达自动化',
        description: '哨兵和雷达更依赖自动化能力，涉及定位、感知、地图理解、目标发布和策略协同。我们把重点放在可靠通信、场地建模、状态估计和可复盘日志上，让算法组能快速定位问题。',
        tools: ['Python', 'C++', 'OpenCV', 'Pytorch', 'Git', 'Linux', 'Docker', 'Matlab'],
        code: 'https://github.com/robomaster',
        role: '感知 / 导航 / 决策',
        demo: 'https://bbs.robomaster.com/',
    },
    {
        id: 4,
        name: '队伍知识库与备赛周报',
        description: "RoboMaster 不是只靠某个技术点就能赢的比赛。我们需要把规则变化、物料进度、接口定义、测试结论、故障复盘和下周计划沉淀下来，让每届队员都能接上前人的工程经验。",
        tools: ['Markdown', 'Git', 'React', 'Next JS', "Tailwind", 'Nginx'],
        code: 'https://github.com/robomaster',
        demo: 'https://www.robomaster.com/zh-CN',
        role: '项目管理 / 知识沉淀',
    }
];


// Do not remove any property.
// Leave it blank instead as shown below

// {
//     id: 1,
//     name: '',
//     description: "",
//     tools: [],
//     role: '',
//     code: '',
//     demo: '',
// },
