interface GameStatusRegulation {
  id: number;
  title: string;
  content: string;
}

const gameRegulations: GameStatusRegulation[] = [
  {
    id: 2,
    title: "ABS 추적 실패 시 판정 절차",
    content:
      "기술적 결함으로 ABS 판정 수신이 불가능할 경우, 해당 투구에 한해 주심의 자체 판정으로 대체하며 양 팀 감독에게 즉시 고지한다.",
  },
  {
    id: 23,
    title: "서스펜디드 게임 선언 조건",
    content:
      "조명 시설 고장, 강우 등으로 경기를 지속할 수 없으나 득점 등 기록이 유효한 시점에서 중단될 경우 서스펜디드 게임을 선언하고 추후 재개한다.",
  },
  {
    id: 24,
    title: "강우 콜드게임 성립 요건",
    content:
      "5회말 홈팀 공격이 끝났거나 5회초 원정팀 공격 종료 시점에 홈팀이 앞서고 있을 때 경기가 중단되면 콜드게임으로 성립된다.",
  },
];

interface GameStatusContext {
  absSystemFaulty: boolean; // ABS 고장 여부
  rainInterruption: boolean; // 강우 중단 여부
  currentInning: number; // 현재 이닝 (5 이상이면 유효 기록)
  currentPhase: "top" | "bottom" | "between"; // 공격 진행 상황 (top=초, bottom=말)
  homeTeamLeading: boolean; // 홈팀 앞서는 중
  validRecordsAtInterruption: boolean; // 중단 시점에 유효 기록 존재 여부
}

type GameStatus = "정상진행" | "콜드게임" | "서스펜디드게임" | "진행불가";

function judgeGameStatus(context: GameStatusContext): {
  status: GameStatus;
  regulations: number[];
  reasoning: string;
} {
  let appliedRegulations: number[] = [];
  let reasoning = "";

  // 단계 1: ID 2 적용 - ABS 고장 여부 검토
  reasoning += `\n[단계 1] ID 2 검토 - ABS 고장 시 대체 절차\n`;
  if (context.absSystemFaulty) {
    reasoning += `✅ ABS 고장 감지 → 주심 자체 판정으로 대체하여 경기 진행 가능\n`;
    appliedRegulations.push(2);
  } else {
    reasoning += `ℹ️ ABS 정상 작동 중\n`;
  }

  // 단계 2: ID 24 적용 - 강우 콜드 요건 검토
  reasoning += `\n[단계 2] ID 24 검토 - 강우 콜드게임 성립 요건\n`;

  const coldGameConditionMet =
    context.rainInterruption &&
    context.currentInning >= 5 &&
    ((context.currentPhase === "bottom" && context.currentInning === 5) ||
      (context.currentPhase === "between" && context.currentInning >= 5)) &&
    context.homeTeamLeading &&
    context.validRecordsAtInterruption;

  if (coldGameConditionMet) {
    reasoning += `✅ 콜드게임 요건 충족:\n  - 현재 이닝: ${context.currentInning}회 (5회 이상 ✓)\n  - 진행 상황: 5회말 종료 또는 그 이후 ✓\n  - 홈팀 앞서는 중: ${context.homeTeamLeading} ✓\n  - 유효 기록 존재: ${context.validRecordsAtInterruption} ✓\n  → 콜드게임 성립!\n`;
    appliedRegulations.push(24);
    return {
      status: "콜드게임",
      regulations: appliedRegulations,
      reasoning,
    };
  } else {
    reasoning += `❌ 콜드게임 요건 미충족:\n  - 현재 이닝: ${context.currentInning}회 (5회 이상? ${context.currentInning >= 5 ? "✓" : "✗"})\n  - 진행 상황: ${context.currentPhase} (5회말 종료? ${context.currentPhase === "bottom" && context.currentInning === 5 ? "✓" : "✗"})\n  - 홈팀 앞서는 중: ${context.homeTeamLeading ? "��" : "✗"}\n  - 유효 기록 존재: ${context.validRecordsAtInterruption ? "✓" : "✗"}\n`;
  }

  // 단계 3: ID 23 적용 - 서스펜디드 게임 판정
  reasoning += `\n[단계 3] ID 23 검토 - 서스펜디드 게임 판정\n`;

  if (
    context.rainInterruption &&
    context.validRecordsAtInterruption &&
    !coldGameConditionMet
  ) {
    reasoning += `✅ 서스펜디드게임 요건 충족:\n  - 강우로 경기 지속 불가능: ✓\n  - 중단 시점에 유효 기록 존재: ✓\n  - 콜드게임 조건 미충족 (이닝 미달 또는 다른 사유): ✓\n  → 서스펜디드게임 선언 (추후 재개)\n`;
    appliedRegulations.push(23);
    return {
      status: "서스펜디드게임",
      regulations: appliedRegulations,
      reasoning,
    };
  } else if (context.rainInterruption && !context.validRecordsAtInterruption) {
    reasoning += `❌ 서스펜디드게임 요건 미충족:\n  - 중단 시점에 유효 기록 부재 → 경기 진행 불가\n`;
    return {
      status: "진행불가",
      regulations: appliedRegulations,
      reasoning,
    };
  } else {
    reasoning += `ℹ️ 강우 중단 없음 → 경기 정상 진행\n`;
    return {
      status: "정상진행",
      regulations: appliedRegulations,
      reasoning,
    };
  }
}

// 테스트 케이스 1: ABS 고장 + 5회초 강우 (콜드게임 미달 → 서스펜디드)
console.log("🎮 테스트 케이스 1: ABS 고장 + 5회초 강우 중단");
console.log("상황: ABS 고장, 5회초 원정팀 공격 중 강우, 홈팀 앞서는 중, 유효 기록 있음");

const case1Context: GameStatusContext = {
  absSystemFaulty: true,
  rainInterruption: true,
  currentInning: 5,
  currentPhase: "top", // 5회초
  homeTeamLeading: true,
  validRecordsAtInterruption: true,
};

const result1 = judgeGameStatus(case1Context);
console.log(result1.reasoning);
console.log(`🏁 최종 판정: ${result1.status}`);
console.log(`📍 적용 규정: ID ${result1.regulations.join(", ")}\n`);

// 테스트 케이스 2: ABS 고장 + 5회말 완료 후 강우 (콜드게임 성립)
console.log("🎮 테스트 케이스 2: ABS 고장 + 5회말 종료 후 강우 중단");
console.log("상황: ABS 고장, 5회말 종료 후 강우, 홈팀 앞서는 중, 유효 기록 있음");

const case2Context: GameStatusContext = {
  absSystemFaulty: true,
  rainInterruption: true,
  currentInning: 5,
  currentPhase: "between", // 5회말 종료 후
  homeTeamLeading: true,
  validRecordsAtInterruption: true,
};

const result2 = judgeGameStatus(case2Context);
console.log(result2.reasoning);
console.log(`🏁 최종 판정: ${result2.status}`);
console.log(`📍 적용 규정: ID ${result2.regulations.join(", ")}\n`);

// 테스트 케이스 3: ABS 고장 + 4회 강우 (서스펜디드 미달)
console.log("🎮 테스트 케이스 3: ABS 고장 + 4회 강우 중단");
console.log("상황: ABS 고장, 4회 중 강우, 홈팀 앞서는 중, 유효 기록 있음");

const case3Context: GameStatusContext = {
  absSystemFaulty: true,
  rainInterruption: true,
  currentInning: 4,
  currentPhase: "bottom",
  homeTeamLeading: true,
  validRecordsAtInterruption: true,
};

const result3 = judgeGameStatus(case3Context);
console.log(result3.reasoning);
console.log(`🏁 최종 판정: ${result3.status}`);
console.log(`📍 적용 규정: ID ${result3.regulations.join(", ")}`);