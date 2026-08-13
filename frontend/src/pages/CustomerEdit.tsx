// useParams = URL 의 :id 읽기
import { useParams } from 'react-router-dom';

function CustomerEdit() {
  // /customers/5/edit → id === "5" (문자열)
  const { id } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>고객 수정 (준비 중)</h1>
      <p>고객 ID: {id}</p>
      <p>Work 10 에서 폼을 만듭니다.</p>
      <a href="/customers">고객 목록으로</a>
    </div>
  );
}

export default CustomerEdit;