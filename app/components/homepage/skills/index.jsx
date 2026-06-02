// @flow strict

import { skillsData } from "@/utils/data/skills";
import { skillsImage } from "@/utils/skill-image";
import Image from "next/image";
import Marquee from "react-fast-marquee";

const technicalDirections = [
  {
    title: "机械方向",
    points: [
      "负责底盘、云台、发射机构、取弹结构和整车装配",
      "关注强度、重量、加工可行性、维护便利性和赛场可靠性",
      "把规则需求转成可制造、可调试、可快速维修的机器人结构",
    ],
  },
  {
    title: "电控方向",
    points: [
      "负责电源分配、CAN 通信、底盘与云台控制、裁判系统交互",
      "调试 STM32、传感器、IMU、电机和整车控制链路",
      "通过日志、示波器和实车测试定位故障，保障比赛稳定运行",
    ],
  },
  {
    title: "视觉算法方向",
    points: [
      "负责装甲板识别、自瞄、相机标定、弹道补偿和目标跟踪",
      "研究 OpenCV、深度学习、定位导航、雷达感知和策略决策",
      "把算法从电脑 demo 推到实车联调，重点解决延迟、误检和稳定性",
    ],
  },
];

function Skills() {
  return (
    <div id="skills" className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]">
      <div className="w-[100px] h-[100px] bg-violet-100 rounded-full absolute top-6 left-[42%] translate-x-1/2 filter blur-3xl  opacity-20"></div>

      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent  w-full" />
        </div>
      </div>

      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex  items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            技术方向
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {technicalDirections.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-[#1f223c] bg-[#11152c] p-5 transition-all duration-300 hover:border-violet-500"
          >
            <div className="flex -translate-y-[21px] justify-center">
              <div className="w-3/4">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              </div>
            </div>
            <h3 className="mb-4 text-xl font-semibold text-[#16f2b3]">
              {item.title}
            </h3>
            <div className="space-y-3 text-sm leading-7 text-[#d3d8e8] lg:text-base">
              {item.points.map((point) => (
                <p key={point}>- {point}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full my-12">
        <Marquee
          gradient={false}
          speed={80}
          pauseOnHover={true}
          pauseOnClick={true}
          delay={0}
          play={true}
          direction="left"
        >
          {skillsData.map((skill, id) => (
            <div className="w-36 min-w-fit h-fit flex flex-col items-center justify-center transition-all duration-500 m-3 sm:m-5 rounded-lg group relative hover:scale-[1.15] cursor-pointer"
              key={id}>
              <div className="h-full w-full rounded-lg border border-[#1f223c] bg-[#11152c] shadow-none shadow-gray-50 group-hover:border-violet-500 transition-all duration-500">
                <div className="flex -translate-y-[1px] justify-center">
                  <div className="w-3/4">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 p-6">
                  <div className="h-8 sm:h-10">
                    <Image
                      src={skillsImage(skill)?.src}
                      alt={skill}
                      width={40}
                      height={40}
                      className="h-full w-auto rounded-lg"
                    />
                  </div>
                  <p className="text-white text-sm sm:text-lg">
                    {skill}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default Skills;
