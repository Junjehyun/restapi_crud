// ============================================================
// 이 파일 = "상품 등록" 전용 화면 (지금은 빈 껍데기)
// 라라벨로 치면 create.blade.php 를 먼저 만들고,
// 나중에 폼 필드를 채우는 것과 비슷하다.
// ============================================================

// function 이름 = 화면 이름이라고 생각해도 된다.
// React 에서는 이런 함수를 "컴포넌트" 라고 부른다.
function InsuranceProductCreate() {
    // return 안의 내용이 브라우저에 실제로 그려진다.
    // HTML 처럼 보이지만, 사실은 JavaScript 안의 "JSX" 문법이다.
    return (
        <div style={{ padding: '20px' }}>
            <h1>상품 등록 (준비중)</h1>
            <p>Work4에서 폼을 만듭니다.</p>
            <a href="/">목록으로</a>
        </div>
    );
}

export default InsuranceProductCreate;