// 규정 데이터셋 정의
interface Regulation {
  id: number;
  category: string;
  sub_category: string;
  title: string;
  content: string;
}

const regulations: Regulation[] = [
  {
    id: 4,
    category: "경기운영",
    sub_category: "피치클락",
    title: "피치클락 제한 시간 규정",
    content:
      "투수는 주자가 없을 때 18초, 주자가 있을 때 23초 이내에 투구 동작을 시작해야 한다. 위반 시 볼 1개가 선언된다.",
  },
  {
    id: 5,
    category: "경기운영",
    sub_category: "피치클락",
    title: "타자의 타석 이행 의무",
    content:
      "타자는 피치클락 잔여 시간이 8초가 되기 전까지 타석에 들어와 투구 준비를 마쳐야 한다. 위반 시 스트라이크 1개가 선언된다.",
  },
];

// 피치클락 위반 페널티 응답 함수
function getPitchClockPenalties(): string {
  const pitcherReg = regulations.find((r) => r.id === 4);
  const bitterReg = regulations.find((r) => r.id === 5);

  return `
📋 **피치클락 위반 시 페널티 규정**

▶️ **투수의 페널티 (ID 4)**
  - 규정명: ${pitcherReg?.title}
  - 내용: ${pitcherReg?.content}
  - 페널티: **볼(Ball) 1개 선언**

▶️ **타자의 페널티 (ID 5)**
  - 규정명: ${bitterReg?.title}
  - 내용: ${bitterReg?.content}
  - 페널티: **스트라이크(Strike) 1개 선언**

📌 핵심 요약:
- 투수 위반: 18초(주자 없음) 또는 23초(주자 있음) 초과 → 볼 1개
- 타자 위반: 8초 전에 타석 진입 미완료 → 스트라이크 1개
  `;
}

// 테스트
console.log(getPitchClockPenalties());