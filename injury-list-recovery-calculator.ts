interface InjuryRegulation {
  id: number;
  title: string;
  content: string;
}

const injuryRegulations: InjuryRegulation[] = [
  {
    id: 8,
    title: "부상자 명단(IL) 등록 조건",
    content:
      "현역 선수 엔트리에서 말소된 선수가 부상으로 인해 복귀가 불가능할 경우, 진단서를 첨부하여 10일/15일/30일 부상자 명단에 등록할 수 있다.",
  },
  {
    id: 9,
    title: "부상자 명단 소급 적용 규정",
    content:
      "엔트리 말소일로부터 최대 3일 전까지 소급하여 부상자 명단 기간을 산정할 수 있다. 단, 해당 기간 중 경기에 출전한 사실이 없어야 한다.",
  },
  {
    id: 10,
    title: "부상자 명단 선수 교체 제한",
    content:
      "부상자 명단에 등록된 선수는 최소 10일이 경과해야 1군 엔트리로 복귀할 수 있으며, 이 기간 동안 퓨처스 리그 경기에 출전할 수 없다.",
  },
];

interface PlayerInjuryCase {
  playerName: string;
  lastGameDate: Date; // 마지막 경기 출전일
  delayedDate: Date; // 오늘 (엔트리 말소일)
  playedInBackdateWindow: boolean; // 소급 기간(3일)에 경기 출전 여부
}

function calculateRecoveryDate(
  playerCase: PlayerInjuryCase
): {
  recoveryDate: Date;
  daysTillRecovery: number;
  reasoning: string;
} {
  const today = playerCase.delayedDate;
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // 단계 1: ID 9 검토 - 소급 적용 가능 여부
  let registrationStartDate: Date;
  let backdateApplied = false;

  if (!playerCase.playedInBackdateWindow) {
    // 3일 전 경기에 출전하지 않았으므로 소급 적용 가능
    registrationStartDate = threeDaysAgo;
    backdateApplied = true;
  } else {
    // 소급 기간에 경기 출전 → 오늘부터 기산
    registrationStartDate = today;
    backdateApplied = false;
  }

  // 단계 2: ID 10 적용 - 최소 10일 경과 규정
  const minimumRecoveryDays = 10;
  const recoveryDate = new Date(registrationStartDate);
  recoveryDate.setDate(recoveryDate.getDate() + minimumRecoveryDays);

  // 실제 경과 일수 (오늘 기준)
  const daysTillRecovery = Math.ceil(
    (recoveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const reasoning = `
ID 9 검토: ${
    backdateApplied
      ? "✅ 소급 기간(3일) 중 경기 출전 없음 → 소급 적용 가능"
      : "❌ 소급 기간(3일) 중 경기 출전 있음 → 소급 적용 불가"
  }

등록 시작일: ${
    backdateApplied
      ? `${threeDaysAgo.toISOString().split("T")[0]} (3일 전 소급)`
      : `${today.toISOString().split("T")[0]} (오늘)`
  }

ID 10 적용: ${minimumRecoveryDays}일 경과 필요
복귀 가능 날짜: ${recoveryDate.toISOString().split("T")[0]}
  `;

  return { recoveryDate, daysTillRecovery, reasoning };
}

// 테스트 케이스 1: 3일 전에 경기 출전
const case1: PlayerInjuryCase = {
  playerName: "A선수",
  lastGameDate: new Date("2026-03-31"),
  delayedDate: new Date("2026-04-03"),
  playedInBackdateWindow: true, // 3일 전 경기에 출전
};

console.log("📋 테스트 케이스 1: A선수 (소급 불가능)");
console.log("상황: 3일 전(3월 31일)에 경기 출전, 오늘(4월 3일) 부상 말소");
const result1 = calculateRecoveryDate(case1);
console.log(result1.reasoning);
console.log(
  `⏰ 복귀 예상 일자: ${result1.recoveryDate.toISOString().split("T")[0]} (${result1.daysTillRecovery}일 후)`
);

// 테스트 케이스 2: 3일 전에 경기 출전 없음
const case2: PlayerInjuryCase = {
  playerName: "B선수",
  lastGameDate: new Date("2026-03-28"),
  delayedDate: new Date("2026-04-03"),
  playedInBackdateWindow: false, // 3일 전 경기에 출전 안 함
};

console.log("
📋 테스트 케이스 2: B선수 (소급 가능)");
console.log("상황: 4일 전(3월 30일)이 마지막 경기, 오늘(4월 3일) 부상 말소");
const result2 = calculateRecoveryDate(case2);
console.log(result2.reasoning);
console.log(
  `⏰ 복귀 예상 일자: ${result2.recoveryDate.toISOString().split("T")[0]} (${result2.daysTillRecovery}일 후)`
);